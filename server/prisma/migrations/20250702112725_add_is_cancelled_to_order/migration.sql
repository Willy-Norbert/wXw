-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" INTEGER,
ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;
