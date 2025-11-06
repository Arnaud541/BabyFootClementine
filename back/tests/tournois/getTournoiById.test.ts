import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("GET /api/tournois/:id", () => {
  let tournoiId: string;
  beforeEach(async () => {
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
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait retourner les détails du tournoi par son ID", async () => {
      const response = await request(app)
        .get(`/api/tournois/${tournoiId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("id", tournoiId);
      expect(response.body.data).toHaveProperty("nom", "Tournoi Test");
      expect(response.body.data).toHaveProperty("date");
      expect(response.body.data).toHaveProperty("description", null);
      expect(response.body.data).toHaveProperty("estTermine", false);
      expect(response.body.data).toHaveProperty("joueursInscrits", []);
      expect(response.body.data).toHaveProperty("equipes", []);
      expect(response.body.data).toHaveProperty("matchs", []);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait gérer les erreurs lors de la récupération du tournoi par son ID", async () => {
      // Simuler une erreur en supprimant temporairement la méthode findById
      const originalFindById = prisma.tournoi.findUnique;
      prisma.tournoi.findUnique = jest
        .fn()
        .mockRejectedValue(new Error("Erreur de base de données"));

      const response = await request(app)
        .get(`/api/tournois/${tournoiId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Erreur de base de données");

      // Restaurer la méthode originale
      prisma.tournoi.findUnique = originalFindById;
    });

    it("devrait retourner une erreur 400 si l'identifiant du tournoi est invalide", async () => {
      const response = await request(app)
        .get(`/api/tournois/invalid-id`)
        .expect(400);

      expect(response.body.error.message).toEqual(
        "Identifiant du tournoi invalide"
      );
      expect(response.body.success).toBe(false);
    });

    it("devrait retourner une erreur 404 si le tournoi n'existe pas", async () => {
      const response = await request(app)
        .get(`/api/tournois/ccae7c7e-111e-4a85-bb58-2b4576080f8c`)
        .expect(404);

      expect(response.body.error.message).toEqual("Ce tournoi n'existe pas");
      expect(response.body.success).toBe(false);
    });
  });
});
