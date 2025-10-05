import z from "zod";

export const userIdSchema = z.uuid({
  version: "v4",
  error: "Identifiant utilisateur invalide",
});
