import { NextFunction, Request, Response } from "express";
import { TournoiService } from "../services/tournoi.services";
import {
  tournoiIdSchema,
  tournoiUpdateSchema,
} from "../lib/schemas/tournoiSchema";
import { creationEquipeSchema } from "../lib/schemas/equipeSchema";

export class TournoiController {
  private tournoiService: TournoiService;

  constructor() {
    this.tournoiService = new TournoiService();
  }

  /**
   * Récupère la liste de tous les tournois.
   * @param req - La requête HTTP.
   * @param res - La réponse HTTP.
   */
  public getTournois = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tournois = await this.tournoiService.findAll();
      res.status(200).json({ success: true, data: tournois });
    } catch (error: any) {
      // throw error;
      next(error);
    }
  };

  /**
   * Récupère les détails d'un tournoi par son ID.
   * @param req - La requête HTTP.
   * @param res - La réponse HTTP.
   */
  public getTournoiById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tournoiId = tournoiIdSchema.parse(req.params.id);
      const tournoi = await this.tournoiService.findById(tournoiId);
      res.status(200).json({ success: true, data: tournoi });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Modifier les détails d'un tournoi par son ID.
   * @param req - La requête HTTP.
   * @param res - La réponse HTTP.
   */
  public updateTournoiById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tournoiId = tournoiIdSchema.parse(req.params.id);
      const tournoiBody = tournoiUpdateSchema.parse(req.body);
      const updateTournoi = await this.tournoiService.update(
        tournoiId,
        tournoiBody
      );
      res.status(200).json({ success: true, data: updateTournoi });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Supprime un tournoi par son ID.
   * @param req - La requête HTTP.
   * @param res - La réponse HTTP.
   */
  public deleteTournoiById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tournoiId = tournoiIdSchema.parse(req.params.id);
      await this.tournoiService.delete(tournoiId);
      res.status(204).end();
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Ajoute une équipe à un tournoi.
   * @param req - La requête HTTP.
   * @param res - La réponse HTTP.
   * @returns - La promesse de la réponse HTTP.
   */
  public createEquipesTournoi = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { equipes } = req.body;
      const tournoiId = tournoiIdSchema.parse(req.params.id);
      const equipesValides = creationEquipeSchema.parse(equipes);

      await this.tournoiService.createEquipesTournoi(tournoiId, equipesValides);
      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      next(error);
    }
  };
}
