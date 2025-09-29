// Construction des contrôleurs utilisateur (gestion des requêtes et réponses)

// Exemple d'utilisation d'un controller avec service

import { Request, Response } from "express";
import UserService from "../services/user.services";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const utilisateurs = await this.userService.getAllUsers();
      res.status(200).json(utilisateurs);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  };
}

export default UserController;
