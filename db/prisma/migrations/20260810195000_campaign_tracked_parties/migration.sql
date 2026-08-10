-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN "clientPartyCode" TEXT;
ALTER TABLE "campaigns" ADD COLUMN "trackedParties" JSONB;
