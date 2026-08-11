-- CreateEnum
CREATE TYPE "CollationActionType" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "collation_action_logs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "collationResultId" TEXT NOT NULL,
    "action" "CollationActionType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "CollationResultStatus",
    "toStatus" "CollationResultStatus" NOT NULL,
    "comment" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collation_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collation_action_logs_collationResultId_createdAt_idx" ON "collation_action_logs"("collationResultId", "createdAt");

-- CreateIndex
CREATE INDEX "collation_action_logs_campaignId_createdAt_idx" ON "collation_action_logs"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "collation_action_logs_actorId_idx" ON "collation_action_logs"("actorId");

-- AddForeignKey
ALTER TABLE "collation_action_logs" ADD CONSTRAINT "collation_action_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collation_action_logs" ADD CONSTRAINT "collation_action_logs_collationResultId_fkey" FOREIGN KEY ("collationResultId") REFERENCES "collation_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collation_action_logs" ADD CONSTRAINT "collation_action_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
