import { TournoiDetails, TournoiSummary } from "../lib/definitions";
import { prisma } from "../prisma/client";
import { Prisma, Tournoi } from "../prisma/generated/client";

export class TournoiService {
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
}
