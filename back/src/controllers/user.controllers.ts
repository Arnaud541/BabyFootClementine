import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.services";
import { userIdSchema } from "../lib/schemas/userSchema";
import { tournoiIdSchema } from "../lib/schemas/tournoiSchema";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Inscrit un utilisateur à un tournoi
   * @param req
   * @param res
   */
  public subscribeUtilisateurToTournoi = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = userIdSchema.parse(req.params.userId);
      const tournoiId = tournoiIdSchema.parse(req.params.tournoiId);

      await this.userService.subscribeUtilisateurToTournoi(userId, tournoiId);
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export default UserController;
