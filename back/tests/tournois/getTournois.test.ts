import request from "supertest";
import { prisma } from "../../src/prisma/client";
import { app } from "../../src/app";

describe("GET /api/tournois", () => {
  beforeEach(async () => {
    // Insérer des tournois de test dans la base de données
    await prisma.tournoi.createMany({
      data: [
        {
          nom: "Tournoi Test 1",
          date: new Date(),
        },
        {
          nom: "Tournoi Test 2",
          date: new Date(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait retourner la liste des tournois", async () => {
      const response = await request(app).get("/api/tournois").expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.success).toBe(true);
    });

    it("devrait retourner un tableau vide si aucun tournoi n'est trouvé", async () => {
      // Supprimer tous les tournois de la base de données
      await prisma.tournoi.deleteMany();

      const response = await request(app).get("/api/tournois").expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait gérer les erreurs lors de la récupération des tournois", async () => {
      // Simuler une erreur en supprimant temporairement la méthode findAll
      const originalFindAll = prisma.tournoi.findMany;
      prisma.tournoi.findMany = jest
        .fn()
        .mockRejectedValue(new Error("Erreur de base de données"));

      const response = await request(app).get("/api/tournois").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Erreur de base de données");

      // Restaurer la méthode originale
      prisma.tournoi.findMany = originalFindAll;
    });
  });
});
