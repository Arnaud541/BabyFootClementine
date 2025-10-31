// Construction du contrôleur utilisateur (gestion des requêtes et réponses)

import { Request, Response } from "express";
import UserService from "../services/user.services";
import { userIdSchema } from "../lib/schemas/userSchema";
import { z } from "zod";
import { tournoiIdSchema } from "../lib/schemas/tournoiSchema";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Récupère les tournois auxquels un utilisateur est inscrit
   * @param req
   * @param res
   */
  public getTournoisByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = userIdSchema.parse(req.params.id);
      const tournois = await this.userService.getTournoisByUserId(userId);
      res.status(200).json(tournois);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { message: error.issues[0]?.message } });
        return;
      }

      res.status(500).json({ error: { message: error.message } });
      return;
    }
  };

  /**
   * Inscrit un utilisateur à un tournoi
   * @param req
   * @param res
   */
  public subscribeUserToTournoi = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = userIdSchema.parse(req.params.userId);
      const tournoiId = tournoiIdSchema.parse(req.params.tournoiId);

      await this.userService.subscribeUserToTournoi(userId, tournoiId);
      res.status(200).json({ message: "Inscription au tournoi réussie" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { message: error.issues[0]?.message } });
        return;
      }

      res.status(500).json({ error: { message: error.message } });
      return;
    }
  };
}

export default UserController;
