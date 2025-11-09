import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("DELETE /tournois/:tournoiId/equipes/:equipeId", () => {
  let tournoiId: string;
  let equipeId: string;
  let userId1: string;
  let userId2: string;

  beforeEach(async () => {
    // Créer des utilisateurs de test
    const users = await prisma.utilisateur.createManyAndReturn({
      data: [
        {
          email: "harrypotter@test.com",
          prenom: "Harry",
          nom: "Potter",
          password: "hashedpassword",
        },
        {
          email: "hermionegranger@test.com",
          prenom: "Hermione",
          nom: "Granger",
          password: "hashedpassword1",
        },
        {
          email: "ronweasley@test.com",
          prenom: "Ron",
          nom: "Weasley",
          password: "hashedpassword2",
        },
        {
          email: "lunalovegood@test.com",
          prenom: "Luna",
          nom: "Lovegood",
          password: "hashedpassword3",
        },
      ],
    });

    userId1 = users[0].id;
    userId2 = users[1].id;

    // Créer un tournoi avec des joueurs inscrits et une équipe
    const tournoi = await prisma.tournoi.create({
      data: {
        nom: "Tournoi Test",
        date: new Date(),
        joueursInscrits: {
          connect: [{ id: userId1 }, { id: userId2 }],
        },
        equipes: {
          create: {
            nom: "Equipe Test",
            joueurs: {
              connect: [{ id: userId1 }, { id: userId2 }],
            },
          },
        },
      },
      include: { equipes: true },
    });

    tournoiId = tournoi.id;
    equipeId = tournoi.equipes[0].id;
  });

  afterEach(async () => {
    await prisma.utilisateur.deleteMany();
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait supprimer une équipe du tournoi", async () => {
      const response = await request(app)
        .delete(`/api/tournois/${tournoiId}/equipes/${equipeId}`)
        .send()
        .expect(204);

      const updatedEquipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
      });

      expect(updatedEquipe).toBeNull();
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait retourner une erreur si l'équipe n'existe pas", async () => {
      const equipeInexistantId = "9fced75d-81fc-4487-b9aa-c4e13ded0d38";
      const response = await request(app)
        .delete(`/api/tournois/${tournoiId}/equipes/${equipeInexistantId}`)
        .send()
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Cette équipe n'existe pas");
    });
  });
});
