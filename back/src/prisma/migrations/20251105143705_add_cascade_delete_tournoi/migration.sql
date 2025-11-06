-- DropForeignKey
ALTER TABLE "public"."Equipe" DROP CONSTRAINT "Equipe_tournoiId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_tournoiId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Equipe" ADD CONSTRAINT "Equipe_tournoiId_fkey" FOREIGN KEY ("tournoiId") REFERENCES "public"."Tournoi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_tournoiId_fkey" FOREIGN KEY ("tournoiId") REFERENCES "public"."Tournoi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
