-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "refundedAmount" DOUBLE PRECISION,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT;
