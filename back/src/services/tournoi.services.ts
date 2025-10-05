import { prisma } from "../prisma/client";
import { Tournoi } from "../prisma/generated/client";

export class TournoiService {
  public async getAllTournois(): Promise<Tournoi[]> {
    try {
      const tournois = await prisma.tournoi.findMany();
      return tournois;
    } catch (error) {
      throw new Error("Erreur de récupération des tournois");
    }
  }
}
