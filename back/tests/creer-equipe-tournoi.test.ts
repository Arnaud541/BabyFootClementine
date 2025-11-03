// tests/tournoi.test.ts
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma/client";
import { uuid, uuidv4 } from "zod";

describe("POST /api/tournois/:id/equipes", () => {
  let tournoiId: string;
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
          email: "joueur3@test.com",
          prenom: "Joueur3",
          nom: "Test",
          password: "hashedpassword2",
        },
        {
          email: "joueur4@test.com",
          prenom: "Joueur4",
          nom: "Test",
          password: "hashedpassword3",
        },
      ],
    });

    [userId1, userId2, userId3, userId4] = users.map((u) => u.id);

    // Créer un tournoi avec des joueurs inscrits
    const tournoi = await prisma.tournoi.create({
      data: {
        nom: "Tournoi Test",
        date: new Date(),
        joueursInscrits: {
          connect: [
            { id: userId1 },
            { id: userId2 },
            { id: userId3 },
            { id: userId4 },
          ],
        },
      },
    });

    tournoiId = tournoi.id;
  });

  afterEach(async () => {
    await prisma.utilisateur.deleteMany();
    await prisma.equipe.deleteMany();
    await prisma.tournoi.deleteMany();
  });

  describe("Cas de succès", () => {
    it("devrait créer une équipe avec succès", async () => {
      const equipeData = {
        equipes: [
          {
            nom: "Équipe Alpha",
            joueursIds: [userId1, userId2],
          },
        ],
      };

      const response = await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send(equipeData)
        .expect(201);

      // Vérifier que l'équipe a été créée
      const equipes = await prisma.equipe.findMany({
        where: { tournoiId },
        include: { joueurs: true },
      });

      expect(equipes).toHaveLength(1);
      expect(equipes[0].nom).toBe("Équipe Alpha");
      expect(equipes[0].joueurs).toHaveLength(2);
      expect(equipes[0].joueurs.map((j) => j.id)).toEqual(
        expect.arrayContaining([userId1, userId2])
      );
    });

    it("devrait créer plusieurs équipes simultanément", async () => {
      const equipesData = {
        equipes: [
          {
            nom: "Équipe Alpha",
            joueursIds: [userId1, userId2],
          },
          {
            nom: "Équipe Beta",
            joueursIds: [userId3, userId4],
          },
        ],
      };

      await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send(equipesData)
        .expect(201);

      const equipes = await prisma.equipe.findMany({
        where: { tournoiId },
        include: { joueurs: true },
      });

      expect(equipes).toHaveLength(2);
      expect(equipes.map((e) => e.nom)).toEqual(
        expect.arrayContaining(["Équipe Alpha", "Équipe Beta"])
      );
      expect(equipes[0].joueurs).toHaveLength(2);
      expect(equipes[1].joueurs).toHaveLength(2);
      expect(equipes[0].joueurs.map((j) => j.id)).toEqual(
        expect.arrayContaining([userId1, userId2])
      );
      expect(equipes[1].joueurs.map((j) => j.id)).toEqual(
        expect.arrayContaining([userId3, userId4])
      );
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait échouer si le tournoi n'existe pas", async () => {
      const equipeData = {
        equipes: [
          {
            nom: "Équipe Test",
            joueursIds: [userId1, userId2],
          },
        ],
      };

      const tournoiInexistantId = "9fced75d-81fc-4487-b9aa-c4e13ded0d36";

      const response = await request(app)
        .post(`/api/tournois/${tournoiInexistantId}/equipes`)
        .send(equipeData)
        .expect(404);

      expect(response.body.error.message).toEqual("Ce tournoi n'existe pas");
    });

    it("devrait échouer si un joueur n'est pas inscrit au tournoi", async () => {
      // Créer un utilisateur non inscrit
      const userNonInscrit = await prisma.utilisateur.create({
        data: {
          nom: "Non Inscrit",
          prenom: "Non",
          password: "password",
          email: "noninscrit@test.com",
        },
      });

      const equipeData = {
        equipes: [
          {
            nom: "Équipe Invalide",
            joueursIds: [userId1, userNonInscrit.id],
          },
        ],
      };

      const response = await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send(equipeData)
        .expect(500);

      expect(response.body.error.message).toEqual(
        "Un des joueurs n'est pas inscrit au tournoi"
      );
    });

    it("devrait échouer avec des données invalides", async () => {
      const equipeData = {
        equipes: [
          {
            // nom manquant
            joueursIds: [userId1],
          },
        ],
      };

      await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send(equipeData)
        .expect(400);
    });

    it("devrait échouer si aucune équipe n'est fournie", async () => {
      const equipeData = {
        equipes: [],
      };

      await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send(equipeData)
        .expect(400);
    });
  });

  describe("Validation des contraintes métier", () => {
    it("devrait empêcher un joueur d'être dans plusieurs équipes du même tournoi", async () => {
      // Créer une première équipe
      await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send({
          equipes: [
            {
              nom: "Équipe Alpha",
              joueursIds: [userId1, userId2],
            },
          ],
        })
        .expect(201);

      // Essayer de créer une seconde équipe avec le même joueur
      const response = await request(app)
        .post(`/api/tournois/${tournoiId}/equipes`)
        .send({
          equipes: [
            {
              nom: "Équipe Beta",
              joueursIds: [userId1, userId3], // userId1 déjà dans Alpha
            },
          ],
        })
        .expect(500);

      expect(response.body.error.message).toContain("déjà dans une équipe");
    });
  });
});
