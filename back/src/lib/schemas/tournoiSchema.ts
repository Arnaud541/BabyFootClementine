import z from "zod";

export const tournoiIdSchema = z.uuid({
  version: "v4",
  error: "Identifiant tournoi invalide",
});

export const tournoiUpdateSchema = z.object({
  nom: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom doit contenir au maximum 100 caractères")
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Date invalide",
    })
    .optional(),
  description: z
    .string()
    .max(500, "La description doit contenir au maximum 500 caractères")
    .optional(),
  estTermine: z.boolean().optional(),
});
