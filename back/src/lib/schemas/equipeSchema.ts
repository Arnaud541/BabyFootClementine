import z from "zod";

export const creationEquipeSchema = z
  .array(
    z.object({
      nom: z
        .string("Le nom de l'équipe doit être une chaîne de caractères")
        .min(3, "Le nom de l'équipe doit contenir au moins 3 caractères")
        .max(100, "Le nom de l'équipe doit contenir au maximum 100 caractères"),
      joueursIds: z
        .array(
          z.uuid({
            version: "v4",
            error: "L'identifiant d'un joueur est invalide",
          }),
          "La liste des identifiants des joueurs doit être un tableau"
        )
        .min(1, "L'équipe doit contenir au moins un joueur"),
    })
  )
  .min(1, "Au moins une équipe doit être fournie");
