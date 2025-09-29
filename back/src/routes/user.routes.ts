// Routes utilisateur

import { Router } from "express";
import UserController from "../controllers/user.controllers";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/", userController.getAllUsers);

export default userRouter;
