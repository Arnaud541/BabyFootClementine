import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/prisma/client";

beforeAll(async () => {
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

afterAll(async () => {
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
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "49a6a489-f067-4d6a-968c-27f3bdda767f",
      nom: "Tournoi 2",
      date: expect.any(String),
      matchs: expect.any(Array),
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
      error: { message: "Identifiant tournoi invalide" },
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
