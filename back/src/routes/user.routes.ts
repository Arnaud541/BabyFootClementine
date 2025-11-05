// Routes utilisateur

import { Router } from "express";
import UserController from "../controllers/user.controllers";

const userRouter = Router();
const userController = new UserController();

userRouter.patch(
  "/:userId/inscription/tournois/:tournoiId",
  userController.subscribeUtilisateurToTournoi
);

export default userRouter;
