import z from "zod";

export const tournoiIdSchema = z.uuid({
  version: "v4",
  error: "Identifiant du tournoi invalide",
});

export const tournoiUpdateSchema = z.object({
  nom: z
    .string("Le nom du tournoi doit être une chaîne de caractères")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom doit contenir au maximum 100 caractères")
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Date du tournoi invalide",
    })
    .optional(),
  description: z
    .string("La description doit être une chaîne de caractères")
    .max(500, "La description doit contenir au maximum 500 caractères")
    .optional(),
  estTermine: z.boolean().optional(),
});

export const creationTournoiSchema = z.object({
  nom: z
    .string("Le nom du tournoi doit être une chaîne de caractères")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom doit contenir au maximum 100 caractères"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date du tournoi invalide",
  }),
  description: z
    .string("La description doit être une chaîne de caractères")
    .max(500, "La description doit contenir au maximum 500 caractères")
    .optional(),
});
