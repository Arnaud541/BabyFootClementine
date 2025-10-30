// Routes tournoi

import { Router } from "express";
import { TournoiController } from "../controllers/tournoi.controllers";

const tournoiRouter = Router();
const tournoiController = new TournoiController();

tournoiRouter.get("/", tournoiController.getAllTournois);
tournoiRouter.get("/:id", tournoiController.getTournoiById);
tournoiRouter.put("/:id", tournoiController.updateTournoiById);
tournoiRouter.delete("/:id", tournoiController.deleteTournoiById);

export default tournoiRouter;
