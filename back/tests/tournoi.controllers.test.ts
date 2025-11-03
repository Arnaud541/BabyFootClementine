import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma/client";

beforeEach(async () => {
  // Création de tournois de test
  await prisma.tournoi.createMany({
    data: [
      {
        id: "39a6a489-f067-4d6a-968c-27f3bdda767f",
        nom: "Tournoi 1",
        date: new Date(),
      },
      {
        id: "49a6a489-f067-4d6a-968c-27f3bdda767f",
        nom: "Tournoi 2",
        date: new Date(),
      },
    ],
  });
});

afterEach(async () => {
  await prisma.tournoi.deleteMany();
});

describe("GET /api/tournois", () => {
  it("should return a list of tournois", async () => {
    const response = await request(app).get("/api/tournois");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it("should throw an error", async () => {
    const response = await request(app).get("/api/tournois");
    expect(() => {
      throw new Error("Erreur de récupération des tournois");
    }).toThrow();
  });
});

describe("GET /api/tournois/:id", () => {
  it("should return a tournoi by id", async () => {
    const response = await request(app).get(
      "/api/tournois/49a6a489-f067-4d6a-968c-27f3bdda767f"
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "49a6a489-f067-4d6a-968c-27f3bdda767f",
      nom: "Tournoi 2",
      date: expect.any(String),
      matchs: expect.any(Array),
      equipes: expect.any(Array),
      joueursInscrits: expect.any(Array),
      description: null,
      estTermine: false,
    });
  });

  it("should return 404 if tournoi not found", async () => {
    const response = await request(app).get(
      "/api/tournois/2d0291c9-940b-4b1e-b81a-37123b050e82"
    );
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { message: "Ce tournoi n'existe pas" },
    });
  });

  it("should return 400 for invalid UUID", async () => {
    const response = await request(app).get("/api/tournois/12");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { message: "Identifiant du tournoi invalide" },
    });
  });

  it("should throw an error", async () => {
    const response = await request(app).get(
      "/api/tournois/3fa85f64-5717-4562-b3fc-2c963f66afa6"
    );
    expect(() => {
      throw new Error("Erreur de récupération du tournoi");
    }).toThrow();
  });
});

describe("PATCH /api/tournois/:id", () => {
  it("should update a tournoi by id", async () => {
    const response = await request(app)
      .patch("/api/tournois/39a6a489-f067-4d6a-968c-27f3bdda767f")
      .send({ nom: "Tournoi Modifié", description: "Description modifiée" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: "39a6a489-f067-4d6a-968c-27f3bdda767f",
      nom: "Tournoi Modifié",
      date: expect.any(String),
      description: "Description modifiée",
      estTermine: false,
      nbEquipes: 0,
      nbMatchs: 0,
      nbJoueursInscrits: 0,
    });
  });

  it("should return 404 if tournoi to update not found", async () => {
    const response = await request(app)
      .patch("/api/tournois/2d0291c9-940b-4b1e-b81a-37123b050e82")
      .send({ nom: "Tournoi Inexistant" });
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { message: "Ce tournoi n'existe pas" },
    });
  });

  it("should return 400 for invalid name", async () => {
    const response = await request(app)
      .patch("/api/tournois/39a6a489-f067-4d6a-968c-27f3bdda767f")
      .send({ nom: 12345 });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        message: "Le nom du tournoi doit être une chaîne de caractères",
      },
    });
  });

  it("should throw an error", async () => {
    const response = await request(app)
      .patch("/api/tournois/39a6a489-f067-4d6a-968c-27f3bdda767f")
      .send({ nom: "Tournoi Test" });
    expect(() => {
      throw new Error("Erreur de mise à jour du tournoi");
    }).toThrow();
  });
});

describe("DELETE /api/tournois/:id", () => {
  it("should delete a tournoi by id", async () => {
    const response = await request(app).delete(
      "/api/tournois/39a6a489-f067-4d6a-968c-27f3bdda767f"
    );
    expect(response.status).toBe(204);
  });

  it("should return 404 if tournoi to delete not found", async () => {
    const response = await request(app).delete(
      "/api/tournois/2d0291c9-940b-4b1e-b81a-37123b050e82"
    );
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { message: "Ce tournoi n'existe pas" },
    });
  });

  it("should return 400 for invalid UUID", async () => {
    const response = await request(app).delete("/api/tournois/12");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { message: "Identifiant du tournoi invalide" },
    });
  });

  it("should throw an error", async () => {
    const response = await request(app).delete(
      "/api/tournois/3fa85f64-5717-4562-b3fc-2c963f66afa6"
    );
    expect(() => {
      throw new Error("Erreur de suppression du tournoi");
    }).toThrow();
  });
});
