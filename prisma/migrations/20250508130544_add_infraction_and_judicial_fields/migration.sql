-- AlterTable
ALTER TABLE "User" ADD COLUMN     "infractionDate" TIMESTAMP(3),
ADD COLUMN     "infractionPlace" TEXT,
ADD COLUMN     "infractionTime" TEXT,
ADD COLUMN     "judgmentDate" TIMESTAMP(3),
ADD COLUMN     "parquetNumber" TEXT;
