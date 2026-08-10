-- FieldReportStatus enum
CREATE TYPE "FieldReportStatus" AS ENUM ('OPEN', 'ESCALATED', 'RESOLVED');

-- AlterTable field_reports
ALTER TABLE "field_reports" ADD COLUMN "status" "FieldReportStatus" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "field_reports" ADD COLUMN "wardComment" TEXT;
ALTER TABLE "field_reports" ADD COLUMN "handledById" TEXT;
ALTER TABLE "field_reports" ADD COLUMN "handledAt" TIMESTAMP(3);
ALTER TABLE "field_reports" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "field_reports_status_idx" ON "field_reports"("status");
CREATE INDEX "field_reports_wardId_idx" ON "field_reports"("wardId");

ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_handledById_fkey"
  FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable collation_results
ALTER TABLE "collation_results" ADD COLUMN "approvalComment" TEXT;
