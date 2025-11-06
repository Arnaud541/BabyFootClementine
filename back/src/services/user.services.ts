import { prisma } from "../prisma/client";
import { NotFoundError } from "../utils/errors/NotFoundError";

export class UserService {
  public async subscribeUtilisateurToTournoi(
    userId: string,
    tournoiId: string
  ): Promise<void> {
    await prisma.tournoi.update({
      where: { id: tournoiId },
      data: {
        joueursInscrits: {
          connect: { id: userId },
        },
      },
    });
  }
}

export default UserService;
