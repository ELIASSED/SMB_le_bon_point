/*
  Warnings:

  - You are about to drop the column `pieceIdentite` on the `Inscription` table. All the data in the column will be lost.
  - Added the required column `idCard` to the `Inscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inscription" DROP COLUMN "pieceIdentite",
ADD COLUMN     "idCard" TEXT NOT NULL;
