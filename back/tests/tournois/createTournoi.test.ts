import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("POST /api/tournois", () => {
  let tournoiId: string;

  beforeEach(async () => {
    // Créer un tournoi
    const tournoi = await prisma.tournoi.create({
      data: {
        nom: "Tournoi ",
        date: new Date(),
        description: "Description du tournoi à supprimer",
        estTermine: false,
      },
    });

    tournoiId = tournoi.id;
  });

  afterEach(async () => {
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait créer un tournoi existant", async () => {
      const response = await request(app)
        .post(`/api/tournois`)
        .send({
          nom: "Tournoi 1",
          date: new Date(),
          description: "Description du tournoi 1",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
  describe("Cas d'échec", () => {
    it("devrait retourner une erreur si le nom du tournoi est manquant", async () => {
      const response = await request(app)
        .post(`/api/tournois`)
        .send({
          date: new Date(),
          description: "Description du tournoi 1",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Le nom du tournoi est requis");
    });

    it("devrait retourner une erreur si la date du tournoi est manquante", async () => {
      const response = await request(app)
        .post(`/api/tournois`)
        .send({
          nom: "Tournoi 1",
          description: "Description du tournoi 1",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(
        "La date du tournoi est requise"
      );
    });
  });
});
