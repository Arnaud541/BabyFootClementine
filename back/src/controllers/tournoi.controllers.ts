import { Request, Response } from "express";
import { TournoiService } from "../services/tournoi.services";

export class TournoiController {
  private tournoiService: TournoiService;

  constructor() {
    this.tournoiService = new TournoiService();
  }

  public getAllTournois = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const tournois = await this.tournoiService.getAllTournois();
      res.status(200).json(tournois);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };
}
