import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("PATCH /tournois/:tournoiId/equipes/:equipeId", () => {
  let tournoiId: string;
  let equipeId: string;
  let userId1: string;
  let userId2: string;
  let userId3: string;
  let userId4: string;

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
    userId3 = users[2].id;
    userId4 = users[3].id;

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
    it("devrait mettre à jour un joueur d'une équipe du tournoi", async () => {
      // Inscrire le troisième utilisateur au tournoi
      await prisma.tournoi.update({
        where: { id: tournoiId },
        data: {
          joueursInscrits: {
            connect: { id: userId3 },
          },
        },
      });

      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          joueursIds: [
            {
              currentUserId: userId1,
              newUserId: userId3,
            },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updatedEquipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
        include: { joueurs: true },
      });

      expect(updatedEquipe?.joueurs.some((j) => j.id === userId3)).toBe(true);
      expect(updatedEquipe?.joueurs.some((j) => j.id === userId2)).toBe(true);
      expect(updatedEquipe?.joueurs.some((j) => j.id === userId1)).toBe(false);
      expect(updatedEquipe?.joueurs.length).toBe(2);
    });

    it("devrait mettre à jour deux joueurs d'une équipe du tournoi", async () => {
      // Inscrire le troisième et quatrième utilisateur au tournoi
      await prisma.tournoi.update({
        where: { id: tournoiId },
        data: {
          joueursInscrits: {
            connect: [{ id: userId3 }, { id: userId4 }],
          },
        },
      });

      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          joueursIds: [
            {
              currentUserId: userId1,
              newUserId: userId3,
            },
            {
              currentUserId: userId2,
              newUserId: userId4,
            },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updatedEquipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
        include: { joueurs: true },
      });

      expect(updatedEquipe?.joueurs.some((j) => j.id === userId4)).toBe(true);
      expect(updatedEquipe?.joueurs.some((j) => j.id === userId3)).toBe(true);
      expect(updatedEquipe?.joueurs.some((j) => j.id === userId2)).toBe(false);
      expect(updatedEquipe?.joueurs.some((j) => j.id === userId1)).toBe(false);
      expect(updatedEquipe?.joueurs.length).toBe(2);
    });

    it("devrait mettre à jour le nom d'une équipe du tournoi", async () => {
      const newTeamName = "Equipe Modifiée";

      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          nom: newTeamName,
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updatedEquipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
      });

      expect(updatedEquipe?.nom).toBe(newTeamName);
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait retourner une erreur si l'équipe n'existe pas", async () => {
      const equipeInexistantId = "9fced75d-81fc-4487-b9aa-c4e13ded0d38";
      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}/equipes/${equipeInexistantId}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Cette équipe n'existe pas");
    });

    it("devrait retourner une erreur si un joueur n'est pas inscrit au tournoi", async () => {
      const response = await request(app)
        .patch(`/api/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          nom: "Equipe Modifiée",
          joueursIds: [
            {
              currentUserId: userId1,
              newUserId: userId3,
            },
          ],
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(
        `Le joueur avec l'identifiant : ${userId3} n'est pas inscrit au tournoi`
      );
    });
  });
});
