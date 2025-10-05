import z from "zod";

export const tournoiIdSchema = z.uuid({
  version: "v4",
  error: "Identifiant tournoi invalide",
});
