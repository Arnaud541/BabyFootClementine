import {
  EquipeForm,
  TournoiDetails,
  TournoiSummary,
  TournoiUpdateParams,
} from "../lib/definitions";
import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class TournoiService {
  /**
   * Récupère la liste de tous les tournois.
   * @returns - La liste des tournois.
   */
  public async getAllTournois(): Promise<TournoiSummary[]> {
    try {
      const tournois = await prisma.tournoi.findMany({
        select: {
          id: true,
          nom: true,
          date: true,
          description: true,
          estTermine: true,
          _count: {
            select: { equipes: true, matchs: true, joueursInscrits: true },
          },
        },
      });
      return tournois.map((tournoi) => ({
        id: tournoi.id,
        nom: tournoi.nom,
        date: tournoi.date,
        description: tournoi.description,
        estTermine: tournoi.estTermine,
        nbEquipes: tournoi._count.equipes,
        nbMatchs: tournoi._count.matchs,
        nbJoueursInscrits: tournoi._count.joueursInscrits,
      }));
    } catch (error) {
      throw new Error("Erreur de récupération des tournois");
    }
  }

  /**
   * Récupère un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à récupérer.
   * @returns - Les détails du tournoi.
   */
  public async getTournoiById(tournoiId: string): Promise<TournoiDetails> {
    try {
      const tournoi = await prisma.tournoi.findUniqueOrThrow({
        where: { id: tournoiId },
        select: {
          id: true,
          nom: true,
          date: true,
          description: true,
          estTermine: true,
          joueursInscrits: { select: { id: true, prenom: true, nom: true } },
          equipes: {
            select: {
              id: true,
              nom: true,
              joueurs: { select: { id: true, prenom: true, nom: true } },
            },
          },
          matchs: {
            select: {
              id: true,
              equipeA: {
                select: {
                  id: true,
                  nom: true,
                  joueurs: { select: { id: true, prenom: true, nom: true } },
                },
              },
              equipeB: {
                select: {
                  id: true,
                  nom: true,
                  joueurs: { select: { id: true, prenom: true, nom: true } },
                },
              },
              scoreA: true,
              scoreB: true,
            },
          },
        },
      });
      return tournoi;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Ce tournoi n'existe pas",
          {
            code: "P2025",
            clientVersion: "6.16.2",
          }
        );
      }

      throw new Error("Erreur de récupération du tournoi");
    }
  }

  /**
   * Met à jour un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à mettre à jour.
   * @param updateData - Les données de mise à jour du tournoi.
   * @returns - Le tournoi mis à jour.
   */
  public async updateTournoiById(
    tournoiId: string,
    updateData: TournoiUpdateParams
  ): Promise<TournoiSummary> {
    try {
      const { nom, date, description, estTermine } = updateData;
      const updatedTournoi = await prisma.tournoi.update({
        select: {
          id: true,
          nom: true,
          date: true,
          description: true,
          estTermine: true,
          _count: {
            select: { equipes: true, matchs: true, joueursInscrits: true },
          },
        },
        where: { id: tournoiId },
        data: {
          nom: nom ?? Prisma.skip,
          date: date ?? Prisma.skip,
          description: description ?? Prisma.skip,
          estTermine: estTermine ?? Prisma.skip,
        },
      });

      return {
        id: updatedTournoi.id,
        nom: updatedTournoi.nom,
        date: updatedTournoi.date,
        description: updatedTournoi.description,
        estTermine: updatedTournoi.estTermine,
        nbEquipes: updatedTournoi._count.equipes,
        nbMatchs: updatedTournoi._count.matchs,
        nbJoueursInscrits: updatedTournoi._count.joueursInscrits,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Prisma.PrismaClientKnownRequestError(
            "Ce tournoi n'existe pas",
            {
              code: "P2025",
              clientVersion: "6.16.2",
            }
          );
        }
      }
      throw new Error("Erreur de mise à jour du tournoi");
    }
  }

  /**
   * Supprime un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à supprimer.
   */
  public async deleteTournoiById(tournoiId: string): Promise<void> {
    try {
      await prisma.tournoi.delete({
        where: { id: tournoiId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Prisma.PrismaClientKnownRequestError(
            "Ce tournoi n'existe pas",
            {
              code: "P2025",
              clientVersion: "6.16.2",
            }
          );
        }
      }
      throw new Error("Erreur de suppression du tournoi");
    }
  }

  /**
   * Ajoute une équipe à un tournoi.
   * @param tournoiId - L'ID du tournoi.
   * @param equipes - Les équipes à ajouter.
   */
  public async addEquipesToTournoi(
    tournoiId: string,
    equipes: EquipeForm[]
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Créer les équipes et les associer au tournoi
        const createdEquipes = await tx.equipe.createManyAndReturn({
          data: equipes.map(({ nom }) => ({
            nom,
            tournoiId,
          })),
        });

        // Associer les joueurs aux équipes créées
        for (let i = 0; i < createdEquipes.length; i++) {
          const equipe = createdEquipes[i];
          const equipeForm = equipes[i];
          if (!equipe || !equipeForm) {
            throw new Error("Erreur lors de la création de l'équipe");
          }
          await tx.equipe.update({
            where: { id: equipe.id },
            data: {
              joueurs: {
                connect: equipeForm.joueursIds.map((id) => ({ id })),
              },
            },
          });
        }
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Prisma.PrismaClientKnownRequestError(
            "Ce tournoi ou cette équipe n'existe pas",
            {
              code: "P2025",
              clientVersion: "6.16.2",
            }
          );
        }
      }
      throw new Error("Erreur lors de l'ajout de l'équipe au tournoi");
    }
  }
}
