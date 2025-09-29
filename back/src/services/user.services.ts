// Implémentation des services utilisateur (logique métier)

// Exemple avec Prisma ORM

import { prisma } from "../prisma/client";
import { Utilisateur } from "../prisma/generated/client";

export class UserService {
  public async getAllUsers(): Promise<Utilisateur[]> {
    try {
      const utilisateurs = await prisma.utilisateur.findMany();
      return utilisateurs;
    } catch (error) {
      throw new Error("Erreur de récupération des utilisateurs");
    }
  }
}

export default UserService;
