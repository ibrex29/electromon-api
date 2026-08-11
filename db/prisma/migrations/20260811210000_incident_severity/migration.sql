-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "field_reports" ADD COLUMN "incidentSeverity" "IncidentSeverity";

-- CreateIndex
CREATE INDEX "field_reports_incidentSeverity_idx" ON "field_reports"("incidentSeverity");

-- Backfill from isUrgent flag
UPDATE "field_reports"
SET "incidentSeverity" = CASE WHEN "isUrgent" = true THEN 'HIGH'::"IncidentSeverity" ELSE 'MEDIUM'::"IncidentSeverity" END
WHERE type = 'INCIDENT' AND "incidentSeverity" IS NULL;
