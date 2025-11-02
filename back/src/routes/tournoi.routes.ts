// Routes tournoi

import { Router } from "express";
import { TournoiController } from "../controllers/tournoi.controllers";

const tournoiRouter = Router();
const tournoiController = new TournoiController();

tournoiRouter.get("/", tournoiController.getAllTournois);
tournoiRouter.get("/:id", tournoiController.getTournoiById);
tournoiRouter.patch("/:id", tournoiController.updateTournoiById);
tournoiRouter.delete("/:id", tournoiController.deleteTournoiById);
tournoiRouter.post("/:id/equipes", tournoiController.addEquipesToTournoi);

export default tournoiRouter;
