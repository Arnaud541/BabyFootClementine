import express, { Request, Response } from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth.middlewares";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use("/api/users", userRouter);

app.get("/", authMiddleware, (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port || 3001, () => {
  console.log(`Server is running on port ${port}`);
});
