// Implémentation des services utilisateur (logique métier)

// Exemple avec Prisma ORM

import { prisma } from "../prisma/client";
import { Tournoi } from "../prisma/generated/client";

export class UserService {
  public async getTournoisByUserId(userId: string): Promise<Tournoi[]> {
    try {
      const tournois = await prisma.tournoi.findMany({
        where: { joueursInscrits: { some: { id: userId } } },
      });
      return tournois;
    } catch (error) {
      throw new Error(
        "Erreur de récupération des tournois auxquels l'utilisateur est inscrit"
      );
    }
  }
}

export default UserService;
