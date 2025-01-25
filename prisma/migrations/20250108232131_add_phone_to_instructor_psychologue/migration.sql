/*
  Warnings:

  - Added the required column `phone` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Psychologue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Psychologue" ADD COLUMN     "phone" TEXT NOT NULL;
