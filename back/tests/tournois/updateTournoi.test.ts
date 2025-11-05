import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("PATCH /api/tournois/:id", () => {
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
    it("devrait mettre à jour les détails du tournoi par son ID", async () => {
      const updatedData = {
        nom: "Tournoi Mis à Jour",
        description: "Description mise à jour",
        estTermine: true,
      };

      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.data).toHaveProperty("id", tournoiId);
      expect(response.body.data).toHaveProperty("nom", updatedData.nom);
      expect(response.body.data).toHaveProperty(
        "description",
        updatedData.description
      );
      expect(response.body.data).toHaveProperty(
        "estTermine",
        updatedData.estTermine
      );
      expect(response.body.success).toBe(true);
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait gérer les erreurs lors de la mise à jour du tournoi", async () => {
      // Simuler une erreur en supprimant temporairement la méthode update
      const originalUpdate = prisma.tournoi.update;
      prisma.tournoi.update = jest
        .fn()
        .mockRejectedValue(new Error("Erreur de base de données"));

      const updatedData = {
        nom: "Tournoi Mis à Jour",
        description: "Description mise à jour",
        estTermine: true,
      };

      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}`)
        .send(updatedData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Erreur de base de données");

      // Restaurer la méthode originale
      prisma.tournoi.update = originalUpdate;
    });

    it("devrait échouer si l'identifiant du tournoi est invalide", async () => {
      const updatedData = {
        nom: "Tournoi Mis à Jour",
        description: "Description mise à jour",
        estTermine: true,
      };

      const response = await request(app)
        .patch(`/api/tournois/invalid-id`)
        .send(updatedData)
        .expect(400);

      expect(response.body.error.message).toEqual(
        "Identifiant du tournoi invalide"
      );
      expect(response.body.success).toBe(false);
    });

    it("devrait échouer si le tournoi n'existe pas", async () => {
      const response = await request(app)
        .get(`/api/tournois/ccae7c7e-111e-4a85-bb58-2b4576080f8c`)
        .expect(404);

      expect(response.body.error.message).toEqual("Ce tournoi n'existe pas");
      expect(response.body.success).toBe(false);
    });
  });
});
