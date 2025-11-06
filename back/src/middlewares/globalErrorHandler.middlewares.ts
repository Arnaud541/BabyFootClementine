import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const globalErrorHandlerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Erreur interne du serveur";

  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ success: false, error: { message: error.issues[0]?.message } });
    return;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        res.status(404).json({
          success: false,
          error: { message: "Cette ressource n'existe pas" },
        });
        return;
      case "P2002":
        res.status(409).json({
          success: false,
          error: { message: error.message },
        });
        return;
      default:
        res.status(500).json({
          success: false,
          error: { message: "Erreur de base de données" },
        });
    }
  }
  res.status(status).json({ success: false, error: { message } });
};
