import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/prisma/client";
import { uuid } from "zod";

beforeAll(async () => {
  // Création d'utilisateurs de test
  await prisma.utilisateur.createMany({
    data: [
      {
        id: "19a6a489-f067-4d6a-968c-27f3bdda767f",
        email: "harrypotter@test.com",
        prenom: "Harry",
        nom: "Potter",
        password: "hashedpassword",
      },
      {
        id: "29a6a489-f067-4d6a-968c-27f3bdda767f",
        email: "hermionegranger@test.com",
        prenom: "Hermione",
        nom: "Granger",
        password: "hashedpassword1",
      },
    ],
  });

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

  // Inscription des utilisateurs aux tournois
  await prisma.tournoi.update({
    where: { id: "39a6a489-f067-4d6a-968c-27f3bdda767f" },
    data: {
      joueursInscrits: {
        connect: [{ id: "19a6a489-f067-4d6a-968c-27f3bdda767f" }],
      },
    },
  });
});

afterAll(async () => {
  await prisma.tournoi.deleteMany();
  await prisma.utilisateur.deleteMany();
});

describe("GET /users/:id/tournois", () => {
  it("should return an empty array if user has no tournois", async () => {
    const response = await request(app).get(
      "/api/users/29a6a489-f067-4d6a-968c-27f3bdda767f/tournois"
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual([]);
  });

  it("should return tournois for a user with existing tournois", async () => {
    const response = await request(app).get(
      "/api/users/19a6a489-f067-4d6a-968c-27f3bdda767f/tournois"
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual([
      {
        id: "39a6a489-f067-4d6a-968c-27f3bdda767f",
        nom: "Tournoi 1",
        date: expect.any(String),
        description: null,
        estTermine: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
  });

  it("should throw a validation error if user ID is invalid", async () => {
    const response = await request(app).get("/api/users/1/tournois");
    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toMatchObject({
      error: { message: "Identifiant utilisateur invalide" },
    });
  });

  it("should return an error if server doesn't find user", async () => {
    const response = await request(app).get(
      `/api/users/e2135b87-bf5c-4adf-adae-e406f6188cb3/tournois`
    );
    expect(response.status).toBe(500);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toMatchObject({
      error: {
        message: "Cet utilisateur n'existe pas",
      },
    });
  });
});
