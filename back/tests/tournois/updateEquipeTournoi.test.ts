import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("PATCH /tournois/:id/equipes/:equipeId", () => {
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
        .patch(`/tournois/${tournoiId}/equipes/${equipeId}`)
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
        .patch(`/tournois/${tournoiId}/equipes/${equipeId}`)
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
  });

  describe("Cas d'erreur", () => {
    it("devrait retourner une erreur si l'équipe n'existe pas", async () => {
      const equipeInexistantId = "9fced75d-81fc-4487-b9aa-c4e13ded0d36";
      const response = await request(app)
        .patch(`/tournois/${tournoiId}/equipes/${equipeInexistantId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Équipe non trouvée");
    });

    it("devrait retourner une erreur si le tournoi n'existe pas", async () => {
      const tournoiInexistantId = "3a1f5e2b-5d6c-4e7f-9a8b-1c2d3e4f5g6h";
      const response = await request(app)
        .patch(`/tournois/${tournoiInexistantId}/equipes/${equipeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Tournoi non trouvé");
    });

    it("devrait retourner une erreur si un joueur à remplacer n'est pas dans l'équipe", async () => {
      const response = await request(app)
        .patch(`/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          joueursIds: [
            {
              currentUserId: userId3,
              newUserId: userId4,
            },
          ],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        `Le joueur avec l'identifiant : ${userId3} ne fait pas partie de l'équipe`
      );
    });

    it("devrait retourner une erreur si un joueur n'est pas inscrit au tournoi", async () => {
      const response = await request(app)
        .patch(`/tournois/${tournoiId}/equipes/${equipeId}`)
        .send({
          nom: "Equipe Modifiée",
          joueursIds: [
            {
              currentUserId: userId1,
              newUserId: userId3,
            },
          ],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        `Le joueur avec l'identifiant : ${userId3} n'est pas inscrit au tournoi`
      );
    });
  });
});
