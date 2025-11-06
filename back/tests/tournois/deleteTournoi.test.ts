import { app } from "../../src/app";
import { prisma } from "../../src/prisma/client";
import request from "supertest";

describe("DELETE /api/tournois/:id", () => {
  let tournoiId: string;

  beforeEach(async () => {
    // Créer des utilisateurs
    const users = await prisma.utilisateur.createManyAndReturn({
      data: [
        {
          nom: "Joueur 1",
          prenom: "Prénom 1",
          password: "password1",
          email: "joueur1@example.com",
        },
        {
          nom: "Joueur 2",
          prenom: "Prénom 2",
          password: "password2",
          email: "joueur2@example.com",
        },
        {
          nom: "Joueur 3",
          prenom: "Prénom 3",
          password: "password3",
          email: "joueur3@example.com",
        },
        {
          nom: "Joueur 4",
          prenom: "Prénom 4",
          password: "password4",
          email: "joueur4@example.com",
        },
      ],
    });

    // Créer un tournoi
    const tournoi = await prisma.tournoi.create({
      data: {
        nom: "Tournoi à Supprimer",
        date: new Date(),
        description: "Description du tournoi à supprimer",
        estTermine: false,
        joueursInscrits: {
          connect: [
            { id: users[0].id },
            { id: users[1].id },
            { id: users[2].id },
            { id: users[3].id },
          ],
        },
      },
    });

    tournoiId = tournoi.id;

    // Créer des équipes

    await prisma.equipe.create({
      data: {
        nom: "Équipe 1",
        tournoiId: tournoiId,
        joueurs: {
          connect: [{ id: users[0].id }, { id: users[1].id }],
        },
      },
    });

    await prisma.equipe.create({
      data: {
        nom: "Équipe 2",
        tournoiId: tournoiId,
        joueurs: {
          connect: [{ id: users[2].id }, { id: users[3].id }],
        },
      },
    });

    const equipeA = await prisma.equipe.findFirst({
      where: { tournoiId: tournoiId, nom: "Équipe 1" },
    });
    const equipeB = await prisma.equipe.findFirst({
      where: { tournoiId: tournoiId, nom: "Équipe 2" },
    });

    // Créer un match entre les deux équipes

    if (equipeA && equipeB) {
      await prisma.match.create({
        data: {
          equipeAId: equipeA.id,
          equipeBId: equipeB.id,
          scoreA: 0,
          scoreB: 0,
          tournoiId: tournoiId,
          estTermine: false,
        },
      });
    }
  });

  afterEach(async () => {
    await prisma.tournoi.deleteMany();
    await prisma.equipe.deleteMany();
    await prisma.utilisateur.deleteMany();
    await prisma.match.deleteMany();
  });

  it("devrait supprimer un tournoi existant", async () => {
    const response = await request(app)
      .delete(`/api/tournois/${tournoiId}`)
      .expect(204);

    // Vérifier que le tournoi a été supprimé de la base de données
    const deletedTournoi = await prisma.tournoi.findUnique({
      where: { id: tournoiId },
    });
    expect(deletedTournoi).toBeNull();
  });

  it("devrait retourner une erreur 404 si le tournoi n'existe pas", async () => {
    const nonExistentId = "ccae7c7e-111e-4a85-bb58-2b4576080f8c";

    const response = await request(app)
      .delete(`/api/tournois/${nonExistentId}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe("Cette ressource n'existe pas");
  });

  it("devrait retourner une erreur 400 pour un identifiant de tournoi invalide", async () => {
    const response = await request(app)
      .delete(`/api/tournois/invalid-id`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe("Identifiant du tournoi invalide");
  });
});
