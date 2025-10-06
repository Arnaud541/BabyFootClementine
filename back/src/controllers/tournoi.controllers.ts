import { Request, Response } from "express";
import { TournoiService } from "../services/tournoi.services";
import { Prisma } from "../prisma/generated/client";
import { tournoiIdSchema } from "../lib/schemas/tournoiSchema";
import z from "zod";

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

  public getTournoiById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const tournoiId = tournoiIdSchema.parse(req.params.id);
      const tournoi = await this.tournoiService.getTournoiById(tournoiId);
      res.status(200).json(tournoi);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(404).json({ error: { message: error.message } });
        return;
      }
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { message: error.issues[0]?.message } });
        return;
      }
      res.status(500).json({ error: { message: error.message } });
    }
  };
}
