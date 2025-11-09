import {
  EquipeForm,
  TournoiDetails,
  TournoiSummary,
  TournoiUpdateParams,
  UpdateEquipeBody,
} from "../lib/definitions";
import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../utils/errors/NotFoundError";

export class TournoiService {
  /**
   * Récupère la liste de tous les tournois.
   * @returns - La liste des tournois.
   */
  public async findAll(): Promise<TournoiSummary[]> {
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
  }

  /**
   * Récupère un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à récupérer.
   * @returns - Les détails du tournoi.
   */
  public async findById(tournoiId: string): Promise<TournoiDetails> {
    const tournoi = await prisma.tournoi.findUnique({
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

    if (!tournoi) {
      throw new NotFoundError("Ce tournoi n'existe pas");
    }

    return tournoi;
  }

  /**
   * Met à jour un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à mettre à jour.
   * @param updateData - Les données de mise à jour du tournoi.
   * @returns - Le tournoi mis à jour.
   */
  public async update(
    tournoiId: string,
    updateData: TournoiUpdateParams
  ): Promise<TournoiSummary> {
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

    if (!updatedTournoi) {
      throw new NotFoundError("Le tournoi à mettre à jour n'existe pas");
    }

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
  }

  /**
   * Supprime un tournoi par son ID.
   * @param tournoiId - L'ID du tournoi à supprimer.
   */
  public async delete(tournoiId: string): Promise<void> {
    await prisma.tournoi.delete({
      where: { id: tournoiId },
      select: { nom: true },
    });
  }

  /**
   * Ajoute une équipe à un tournoi.
   * @param tournoiId - L'ID du tournoi.
   * @param equipes - Les équipes à ajouter.
   */
  public async createEquipesTournoi(
    tournoiId: string,
    equipes: EquipeForm[]
  ): Promise<void> {
    // Vérifier que le tournoi existe
    const tournoi = await prisma.tournoi.findUniqueOrThrow({
      where: { id: tournoiId },
      select: { id: true },
    });

    // Vérifier que les utilisateurs sont bien inscrits au tournoi
    const tournoiDetails = await prisma.tournoi.findUniqueOrThrow({
      where: { id: tournoi.id },
      select: { joueursInscrits: { select: { id: true } } },
    });

    const joueursInscritsIds = tournoiDetails.joueursInscrits.map((j) => j.id);
    for (const equipe of equipes) {
      for (const joueurId of equipe.joueursIds) {
        if (!joueursInscritsIds.includes(joueurId)) {
          throw new Error(
            `Le joueur avec l'identifiant : ${joueurId} n'est pas inscrit au tournoi`
          );
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // Vérifier si un utilisateur est déjà dans une équipe du tournoi
      for (const equipe of equipes) {
        for (const joueurId of equipe.joueursIds) {
          const equipeExistante = await tx.equipe.findFirst({
            where: {
              tournoiId: tournoi.id,
              joueurs: { some: { id: joueurId } },
            },
          });
          if (equipeExistante) {
            throw new Error(
              `Le joueur avec l'identifiant : ${joueurId} est déjà dans une équipe du tournoi`
            );
          }
        }
      }
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
  }

  public async updateEquipeTournoi(
    tournoiId: string,
    equipeId: string,
    updateEquipeBody: UpdateEquipeBody
  ): Promise<void> {
    const { nom, joueursIds } = updateEquipeBody;

    // Vérifier que l'équipe existe
    const equipe = await prisma.equipe.findFirst({
      where: { id: equipeId },
    });

    if (!equipe) {
      throw new NotFoundError("Cette équipe n'existe pas");
    }

    // Mettre à jour le nom de l'équipe si fourni
    if (nom) {
      await prisma.equipe.update({
        where: { id: equipeId },
        data: { nom },
      });
    }

    // Mettre à jour les joueurs de l'équipe si des modifications sont fournies
    if (joueursIds && joueursIds.length > 0) {
      // Récupérer les joueurs inscrits au tournoi
      const tournoi = await prisma.tournoi.findUnique({
        where: { id: tournoiId },
        include: { joueursInscrits: true },
      });

      for (const { currentUserId, newUserId } of joueursIds) {
        // Vérifier que le nouvel utilisateur est inscrit au tournoi
        if (!tournoi?.joueursInscrits.some((j) => j.id === newUserId)) {
          throw new Error(
            `Le joueur avec l'identifiant : ${newUserId} n'est pas inscrit au tournoi`
          );
        }

        // Retirer le joueur actuel de l'équipe
        await prisma.equipe.update({
          where: { id: equipeId },
          data: {
            joueurs: {
              disconnect: { id: currentUserId },
            },
          },
        });

        // Ajouter le nouvel identifiant du joueur à l'équipe
        await prisma.equipe.update({
          where: { id: equipeId },
          data: {
            joueurs: {
              connect: { id: newUserId },
            },
          },
        });
      }
    }
  }

  public async deleteEquipeTournoi(
    tournoiId: string,
    equipeId: string
  ): Promise<void> {
    // Vérifier que l'équipe existe
    const equipe = await prisma.equipe.findFirst({
      where: { id: equipeId },
    });

    if (!equipe) {
      throw new NotFoundError("Cette équipe n'existe pas");
    }

    // Supprimer l'équipe
    await prisma.equipe.delete({
      where: { id: equipeId },
    });
  }
}
