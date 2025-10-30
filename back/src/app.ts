import express, { Request, Response } from "express";
import userRouter from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth.middlewares";
import tournoiRouter from "./routes/tournoi.routes";

export const app = express();

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/tournois", tournoiRouter);

app.get("/", authMiddleware, (req: Request, res: Response) => {
  res.send("Hello World!");
});
