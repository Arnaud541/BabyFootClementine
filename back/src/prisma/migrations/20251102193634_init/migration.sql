-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Equipe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tournoiId" TEXT NOT NULL,

    CONSTRAINT "Equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tournoi" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "est_termine" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" TEXT NOT NULL,
    "equipeAId" TEXT NOT NULL,
    "equipeBId" TEXT NOT NULL,
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "tournoiId" TEXT NOT NULL,
    "est_termine" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EquipeToUtilisateur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipeToUtilisateur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_TournoiToUtilisateur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TournoiToUtilisateur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "public"."Utilisateur"("email");

-- CreateIndex
CREATE INDEX "_EquipeToUtilisateur_B_index" ON "public"."_EquipeToUtilisateur"("B");

-- CreateIndex
CREATE INDEX "_TournoiToUtilisateur_B_index" ON "public"."_TournoiToUtilisateur"("B");

-- AddForeignKey
ALTER TABLE "public"."Equipe" ADD CONSTRAINT "Equipe_tournoiId_fkey" FOREIGN KEY ("tournoiId") REFERENCES "public"."Tournoi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_equipeAId_fkey" FOREIGN KEY ("equipeAId") REFERENCES "public"."Equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_equipeBId_fkey" FOREIGN KEY ("equipeBId") REFERENCES "public"."Equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_tournoiId_fkey" FOREIGN KEY ("tournoiId") REFERENCES "public"."Tournoi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipeToUtilisateur" ADD CONSTRAINT "_EquipeToUtilisateur_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipeToUtilisateur" ADD CONSTRAINT "_EquipeToUtilisateur_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TournoiToUtilisateur" ADD CONSTRAINT "_TournoiToUtilisateur_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Tournoi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TournoiToUtilisateur" ADD CONSTRAINT "_TournoiToUtilisateur_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
