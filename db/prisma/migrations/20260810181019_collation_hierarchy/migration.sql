-- CreateEnum
CREATE TYPE "CollationLevel" AS ENUM ('POLLING_UNIT', 'WARD', 'LGA', 'STATE', 'NATIONAL');

-- CreateEnum
CREATE TYPE "CollationResultStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CampaignRole" ADD VALUE 'POLLING_UNIT_OFFICER';
ALTER TYPE "CampaignRole" ADD VALUE 'WARD_RA_OFFICER';
ALTER TYPE "CampaignRole" ADD VALUE 'LGA_COLLATION_OFFICER';
ALTER TYPE "CampaignRole" ADD VALUE 'STATE_COLLATION_OFFICER';
ALTER TYPE "CampaignRole" ADD VALUE 'NATIONAL_COLLATION_OFFICER';

-- AlterEnum
ALTER TYPE "ScopeType" ADD VALUE 'NATIONAL';

-- AlterTable
ALTER TABLE "wards" ADD COLUMN     "registrationAreaCode" TEXT;

-- CreateTable
CREATE TABLE "collation_results" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "level" "CollationLevel" NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "scopeId" TEXT NOT NULL,
    "registeredVoters" INTEGER,
    "accreditedVoters" INTEGER,
    "votesCast" INTEGER,
    "partyResults" JSONB,
    "status" "CollationResultStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "parentResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collation_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collation_results_campaignId_level_status_idx" ON "collation_results"("campaignId", "level", "status");

-- CreateIndex
CREATE INDEX "collation_results_scopeType_scopeId_idx" ON "collation_results"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "collation_results_parentResultId_idx" ON "collation_results"("parentResultId");

-- CreateIndex
CREATE UNIQUE INDEX "collation_results_campaignId_level_scopeType_scopeId_key" ON "collation_results"("campaignId", "level", "scopeType", "scopeId");

-- AddForeignKey
ALTER TABLE "collation_results" ADD CONSTRAINT "collation_results_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collation_results" ADD CONSTRAINT "collation_results_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collation_results" ADD CONSTRAINT "collation_results_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collation_results" ADD CONSTRAINT "collation_results_parentResultId_fkey" FOREIGN KEY ("parentResultId") REFERENCES "collation_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
