-- AlterTable
ALTER TABLE "collation_results" ADD COLUMN "ocrVerification" JSONB;
ALTER TABLE "collation_results" ADD COLUMN "ocrVerifiedAt" TIMESTAMP(3);
