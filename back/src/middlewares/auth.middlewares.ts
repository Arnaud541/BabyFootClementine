// Middleware d'exemple d'authentification

import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Logic to check authentication
  const isAuthenticated = true; // Replace with real authentication logic

  if (isAuthenticated) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};
