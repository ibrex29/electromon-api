-- AlterTable
ALTER TABLE "collation_results" ADD COLUMN "flaggedPollingUnitIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
