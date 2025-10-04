// Implémentation des services utilisateur (logique métier)

// Exemple avec Prisma ORM

import { prisma } from "../prisma/client";
import { Prisma, Tournoi } from "../prisma/generated/client";

export class UserService {
  public async getTournoisByUserId(userId: string): Promise<Tournoi[]> {
    try {
      await prisma.utilisateur.findUniqueOrThrow({
        where: { id: userId },
      });

      const tournois = await prisma.tournoi.findMany({
        where: { joueursInscrits: { some: { id: userId } } },
      });
      return tournois;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Cet utilisateur n'existe pas",
          {
            code: "P2025",
            clientVersion: "6.16.2",
          }
        );
      }

      throw new Error(
        "Erreur de récupération des tournois auxquels l'utilisateur est inscrit"
      );
    }
  }
}

export default UserService;
