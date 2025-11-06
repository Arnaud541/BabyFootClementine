import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("PATCH /api/utilisateurs/:userId/inscription/tournois/:tournoiId", () => {
  let userId: string;
  let tournoiId: string;
  beforeEach(async () => {
    // Insérer un utilisateur de test dans la base de données
    const user = await prisma.utilisateur.create({
      data: {
        nom: "Utilisateur Test",
        prenom: "Test",
        password: "password123",
        email: "utilisateur@test.com",
      },
    });
    userId = user.id;

    // Insérer un tournoi de test dans la base de données
    const tournoi = await prisma.tournoi.create({
      data: {
        nom: "Tournoi Test",
        date: new Date(),
      },
    });
    tournoiId = tournoi.id;
  });

  afterEach(async () => {
    await prisma.utilisateur.deleteMany();
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait inscrire un utilisateur à un tournoi", async () => {
      const response = await request(app)
        .patch(`/api/utilisateurs/${userId}/inscription/tournois/${tournoiId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Vérifier que l'utilisateur est bien inscrit au tournoi dans la base de données
      const tournoi = await prisma.tournoi.findUnique({
        where: { id: tournoiId },
        include: { joueursInscrits: true },
      });
      expect(tournoi?.joueursInscrits.some((u) => u.id === userId)).toBe(true);
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait retourner une erreur 404 si le tournoi n'existe pas", async () => {
      const nonExistentId = "ccae7c7e-111e-4a85-bb58-2b4576080f8c";
      const response = await request(app)
        .patch(
          `/api/utilisateurs/${userId}/inscription/tournois/${nonExistentId}`
        )
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Cette ressource n'existe pas");
    });

    it("devrait retourner une erreur 400 si l'identifiant de l'utilisateur est invalide", async () => {
      const response = await request(app)
        .patch(
          `/api/utilisateurs/invalid-user-id/inscription/tournois/${tournoiId}`
        )
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toEqual(
        "Identifiant utilisateur invalide"
      );
    });

    it("devrait retourner une erreur 400 si l'identifiant du tournoi est invalide", async () => {
      const response = await request(app)
        .patch(
          `/api/utilisateurs/${userId}/inscription/tournois/invalid-tournoi-id`
        )
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toEqual(
        "Identifiant du tournoi invalide"
      );
    });
  });
});
