import express, { Request, Response } from "express";
import userRouter from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth.middlewares";
import tournoiRouter from "./routes/tournoi.routes";
import { globalErrorHandlerMiddleware } from "./middlewares/globalErrorHandler.middlewares";

export const app = express();

app.use(express.json());

app.use("/api/utilisateurs", userRouter);
app.use("/api/tournois", tournoiRouter);

app.use(globalErrorHandlerMiddleware);

app.get("/", authMiddleware, (req: Request, res: Response) => {
  res.send("Hello World!");
});
