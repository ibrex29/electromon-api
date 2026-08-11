-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM (
  'VOTER_INTIMIDATION',
  'BALLOT_SNATCHING',
  'BALLOT_STUFFING',
  'VOTE_BUYING',
  'VIOLENCE_THUGGERY',
  'MATERIALS_SHORTAGE',
  'LATE_OR_FAILED_OPENING',
  'BVAS_MALFUNCTION',
  'UNAUTHORIZED_PERSONNEL',
  'OVERVOTING',
  'OPPOSITION_DISRUPTION',
  'OTHERS'
);

-- AlterEnum
ALTER TYPE "FieldReportType" ADD VALUE 'INCIDENT';

-- AlterTable
ALTER TABLE "field_reports" ADD COLUMN "incidentType" "IncidentType";

-- CreateIndex
CREATE INDEX "field_reports_incidentType_idx" ON "field_reports"("incidentType");

-- Backfill PU security reports created before IncidentType existed
UPDATE "field_reports"
SET type = 'INCIDENT', "incidentType" = 'OTHERS'
WHERE type = 'SECURITY_CONCERN' AND "pollingUnitId" IS NOT NULL;
