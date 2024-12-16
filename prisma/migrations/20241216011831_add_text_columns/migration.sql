/*
  Warnings:

  - You are about to drop the column `pieceDId` on the `Inscription` table. All the data in the column will be lost.
  - Added the required column `pieceIdentite` to the `Inscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inscription" DROP COLUMN "pieceDId",
ADD COLUMN     "pieceIdentite" TEXT NOT NULL;
