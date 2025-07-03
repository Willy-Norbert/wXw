-- AlterEnum
ALTER TYPE "SellerStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "sellerPermissions" JSONB;
