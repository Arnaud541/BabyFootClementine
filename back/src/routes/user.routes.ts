// Routes utilisateur

import { Router } from "express";
import UserController from "../controllers/user.controllers";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/:id/tournois", userController.getTournoisByUserId);
userRouter.patch(
  "/:userId/inscription/tournois/:tournoiId",
  userController.subscribeUserToTournoi
);

export default userRouter;
