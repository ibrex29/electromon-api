import type { PrismaClient } from '../src/generated/client';
import {
  ScopeType,
  CollationLevel,
  CollationResultStatus,
  CollationActionType,
} from '../src/generated/client';

type PartyTotals = Record<string, number>;
type PuStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
type RollupStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

function sumPartyMaps(values: PartyTotals[]): PartyTotals {
  if (values.length === 0) return {};
  const codes = [...new Set(values.flatMap((entry) => Object.keys(entry)))];
  const totals: PartyTotals = Object.fromEntries(codes.map((code) => [code, 0]));
  for (const entry of values) {
    for (const code of codes) {
      totals[code] = (totals[code] ?? 0) + (entry[code] ?? 0);
    }
  }
  return totals;
}

/** Deterministic sample votes — major parties lead; others share remainder */
export function generateSamplePartyResults(index: number, partyCodes: string[]): PartyTotals {
  const registered = 450 + (index * 37) % 550;
  const turnout = 0.55 + (index % 7) * 0.04;
  const votesCast = Math.round(registered * turnout);

  const majorWeight = (code: string): number => {
    switch (code) {
      case 'APC':
        return 0.34 + (index % 5) * 0.02;
      case 'PDP':
        return 0.26 - (index % 4) * 0.02;
      case 'NNPP':
        return 0.1 + (index % 3) * 0.01;
      case 'LP':
        return 0.06 + (index % 2) * 0.005;
      default:
        return 0;
    }
  };

  const rawWeights = partyCodes.map((code, i) =>
    majorWeight(code) > 0 ? majorWeight(code) : 0.015 + (i % 7) * 0.002,
  );
  const weightSum = rawWeights.reduce((sum, w) => sum + w, 0) || 1;
  const shares = rawWeights.map((w) => w / weightSum);

  let remaining = votesCast;
  const results: PartyTotals = {};

  for (let i = 0; i < partyCodes.length; i++) {
    const code = partyCodes[i]!;
    if (i === partyCodes.length - 1) {
      results[code] = Math.max(0, remaining);
    } else {
      const votes = Math.round(votesCast * (shares[i] ?? 0));
      results[code] = votes;
      remaining -= votes;
    }
  }

  return results;
}

interface SeedPuResultInput {
  puId: string;
  index: number;
  partyCodes: string[];
  status: PuStatus;
  submittedById?: string;
  approvedById?: string;
  rejectionReason?: string;
  includeEc8a?: boolean;
  hoursAgo?: number;
}

interface ActorIds {
  puOfficerId?: string;
  wardOfficerId?: string;
  lgaOfficerId?: string;
}

async function writeSeedActionLog(
  prisma: PrismaClient,
  input: {
    campaignId: string;
    collationResultId: string;
    action: CollationActionType;
    actorId: string;
    fromStatus?: CollationResultStatus | null;
    toStatus: CollationResultStatus;
    comment?: string | null;
    hoursAgo?: number;
  },
) {
  const createdAt = new Date(Date.now() - (input.hoursAgo ?? 1) * 60 * 60 * 1000);

  const existing = await prisma.collationActionLog.findFirst({
    where: {
      collationResultId: input.collationResultId,
      action: input.action,
      actorId: input.actorId,
    },
  });
  if (existing) return existing;

  return prisma.collationActionLog.create({
    data: {
      campaignId: input.campaignId,
      collationResultId: input.collationResultId,
      action: input.action,
      actorId: input.actorId,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus,
      comment: input.comment ?? null,
      createdAt,
      metadata: { seeded: true },
    },
  });
}

export async function seedPollingUnitResult(
  prisma: PrismaClient,
  campaignId: string,
  input: SeedPuResultInput,
) {
  const partyResults = generateSamplePartyResults(input.index, input.partyCodes);
  const votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);
  const registeredVoters = votesCast + 120 + (input.index % 80);
  const accreditedVoters = votesCast + (input.index % 12);
  const hoursAgo = input.hoursAgo ?? 6 + (input.index % 10);
  const submittedAt =
    input.status === 'DRAFT' ? null : new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  const approvedAt =
    input.status === 'APPROVED' || input.status === 'REJECTED'
      ? new Date(Date.now() - Math.max(1, hoursAgo - 2) * 60 * 60 * 1000)
      : null;

  const payload = {
    partyResults,
    votesCast,
    registeredVoters,
    accreditedVoters,
    status: input.status as CollationResultStatus,
    submittedById: input.status === 'DRAFT' ? null : (input.submittedById ?? null),
    submittedAt,
    approvedById:
      input.status === 'APPROVED' || input.status === 'REJECTED'
        ? (input.approvedById ?? null)
        : null,
    approvedAt,
    rejectionReason: input.status === 'REJECTED' ? (input.rejectionReason ?? 'Returned for correction') : null,
    approvalComment:
      input.status === 'APPROVED' ? 'Verified against EC8A — figures match' : null,
    ec8aPhotoUrls:
      input.includeEc8a !== false && input.status !== 'DRAFT'
        ? [`http://localhost:3001/uploads/seed-ec8a-${input.puId.slice(-8)}.png`]
        : [],
  };

  const result = await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: CollationLevel.POLLING_UNIT,
        scopeType: ScopeType.POLLING_UNIT,
        scopeId: input.puId,
      },
    },
    update: payload,
    create: {
      campaignId,
      level: CollationLevel.POLLING_UNIT,
      scopeType: ScopeType.POLLING_UNIT,
      scopeId: input.puId,
      ...payload,
    },
  });

  return { partyResults, resultId: result.id, status: input.status };
}

export async function seedWardRollupFromPus(
  prisma: PrismaClient,
  campaignId: string,
  wardId: string,
  partyCodes: string[],
  options: {
    status?: RollupStatus;
    submittedById?: string;
    approvedById?: string;
    rejectionReason?: string;
    /** Only sum APPROVED child PUs (matches production rollup) */
    approvedOnly?: boolean;
  } = {},
) {
  const status = options.status ?? 'APPROVED';
  const approvedOnly = options.approvedOnly ?? true;

  const pus = await prisma.pollingUnit.findMany({
    where: { wardId },
    select: { id: true },
  });

  const puResults = await prisma.collationResult.findMany({
    where: {
      campaignId,
      level: CollationLevel.POLLING_UNIT,
      scopeId: { in: pus.map((pu) => pu.id) },
      ...(approvedOnly ? { status: CollationResultStatus.APPROVED } : {}),
    },
    select: {
      partyResults: true,
      votesCast: true,
      registeredVoters: true,
      accreditedVoters: true,
    },
  });

  if (puResults.length === 0 && status !== 'DRAFT') return null;

  const partyResults = sumPartyMaps(
    puResults.map((result) => (result.partyResults ?? {}) as PartyTotals),
  );
  const votesCast = puResults.reduce((sum, result) => sum + (result.votesCast ?? 0), 0);
  const registeredVoters = puResults.reduce((sum, result) => sum + (result.registeredVoters ?? 0), 0);
  const accreditedVoters = puResults.reduce((sum, result) => sum + (result.accreditedVoters ?? 0), 0);
  const submittedAt =
    status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED'
      ? new Date(Date.now() - 8 * 60 * 60 * 1000)
      : null;
  const approvedAt =
    status === 'APPROVED' || status === 'REJECTED'
      ? new Date(Date.now() - 3 * 60 * 60 * 1000)
      : null;

  const payload = {
    partyResults,
    votesCast,
    registeredVoters,
    accreditedVoters,
    status: status as CollationResultStatus,
    submittedById: options.submittedById ?? null,
    submittedAt,
    approvedById: options.approvedById ?? null,
    approvedAt,
    rejectionReason:
      status === 'REJECTED'
        ? (options.rejectionReason ?? 'Returned to ward for correction')
        : null,
    approvalComment: status === 'APPROVED' ? 'Ward totals verified at LGA' : null,
  };

  const result = await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: CollationLevel.WARD,
        scopeType: ScopeType.WARD,
        scopeId: wardId,
      },
    },
    update: payload,
    create: {
      campaignId,
      level: CollationLevel.WARD,
      scopeType: ScopeType.WARD,
      scopeId: wardId,
      ...payload,
    },
  });

  return { partyResults, resultId: result.id, status };
}

export async function seedLgaRollupFromWards(
  prisma: PrismaClient,
  campaignId: string,
  lgaId: string,
  partyCodes: string[],
  options: {
    status?: RollupStatus;
    approvedOnly?: boolean;
  } = {},
) {
  const status = options.status ?? 'APPROVED';
  const approvedOnly = options.approvedOnly ?? true;

  const wards = await prisma.ward.findMany({
    where: { lgaId },
    select: { id: true },
  });

  const wardResults = await prisma.collationResult.findMany({
    where: {
      campaignId,
      level: CollationLevel.WARD,
      scopeId: { in: wards.map((ward) => ward.id) },
      ...(approvedOnly ? { status: CollationResultStatus.APPROVED } : {}),
    },
    select: { partyResults: true, votesCast: true },
  });

  let partyResults: PartyTotals;
  let votesCast: number;

  if (wardResults.length === 0) {
    partyResults = generateSamplePartyResults(wards.length, partyCodes);
    votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);
  } else {
    partyResults = sumPartyMaps(
      wardResults.map((result) => (result.partyResults ?? {}) as PartyTotals),
    );
    votesCast = wardResults.reduce((sum, result) => sum + (result.votesCast ?? 0), 0);
  }

  await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: CollationLevel.LGA,
        scopeType: ScopeType.LGA,
        scopeId: lgaId,
      },
    },
    update: { partyResults, votesCast, status: status as CollationResultStatus },
    create: {
      campaignId,
      level: CollationLevel.LGA,
      scopeType: ScopeType.LGA,
      scopeId: lgaId,
      partyResults,
      votesCast,
      status: status as CollationResultStatus,
    },
  });

  return partyResults;
}

/**
 * Scenario matrix across Hadejia LGA for end-to-end testing:
 *
 * ATAFI (demo ward / ward.officer@…):
 *   - Mix of DRAFT / SUBMITTED / REJECTED / APPROVED PUs
 *   - Demo PU 17-13-01-001: SUBMITTED (awaiting ward) with EC8A
 *   - Ward rollup REJECTED by LGA (reason visible on Ward Review)
 *
 * Incomplete ward (first non-ATAFI if ready):
 *   - Some PUs not fully approved → LGA cannot approve the ward even if SUBMITTED
 *
 * Other Hadejia wards:
 *   - Mostly full APPROVED PUs + variety of ward statuses for LGA filters
 */
export async function seedHadejiaCollationResults(
  prisma: PrismaClient,
  campaignId: string,
  hadejiaLgaId: string,
  partyCodes: string[],
  actors: ActorIds = {},
) {
  const wards = await prisma.ward.findMany({
    where: { lgaId: hadejiaLgaId },
    include: { pollingUnits: { orderBy: { code: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  const puOfficerId = actors.puOfficerId;
  const wardOfficerId = actors.wardOfficerId;
  const lgaOfficerId = actors.lgaOfficerId;

  let puIndex = 0;
  let seededPus = 0;
  let incompleteWardId: string | null = null;
  let atafiWardId: string | null = null;

  for (const [wardIndex, ward] of wards.entries()) {
    const isAtafi = ward.name.toUpperCase().includes('ATAFI');
    if (isAtafi) atafiWardId = ward.id;

    // First non-ATAFI ward with 4+ PUs = incomplete readiness scenario
    if (!isAtafi && !incompleteWardId && ward.pollingUnits.length >= 4) {
      incompleteWardId = ward.id;
    }

    for (const [puPos, pu] of ward.pollingUnits.entries()) {
      const status = resolvePuStatus({
        isAtafi,
        isIncompleteWard: ward.id === incompleteWardId,
        isDemoPu:
          isAtafi &&
          (pu.code === '17-13-01-001' || puPos === 0),
        puPos,
        wardPuCount: ward.pollingUnits.length,
        puIndex,
      });

      const seeded = await seedPollingUnitResult(prisma, campaignId, {
        puId: pu.id,
        index: puIndex,
        partyCodes,
        status,
        submittedById: puOfficerId,
        approvedById: wardOfficerId,
        rejectionReason:
          status === 'REJECTED'
            ? 'EC8A total does not match entered party votes — please recheck'
            : undefined,
        includeEc8a: status !== 'DRAFT',
        hoursAgo: 4 + (puPos % 12),
      });

      if (puOfficerId && status !== 'DRAFT') {
        await writeSeedActionLog(prisma, {
          campaignId,
          collationResultId: seeded.resultId,
          action: CollationActionType.SUBMITTED,
          actorId: puOfficerId,
          fromStatus: CollationResultStatus.DRAFT,
          toStatus: CollationResultStatus.SUBMITTED,
          hoursAgo: 10,
        });
      }
      if (wardOfficerId && status === 'APPROVED') {
        await writeSeedActionLog(prisma, {
          campaignId,
          collationResultId: seeded.resultId,
          action: CollationActionType.APPROVED,
          actorId: wardOfficerId,
          fromStatus: CollationResultStatus.SUBMITTED,
          toStatus: CollationResultStatus.APPROVED,
          comment: 'Verified against EC8A',
          hoursAgo: 6,
        });
      }
      if (wardOfficerId && status === 'REJECTED') {
        await writeSeedActionLog(prisma, {
          campaignId,
          collationResultId: seeded.resultId,
          action: CollationActionType.REJECTED,
          actorId: wardOfficerId,
          fromStatus: CollationResultStatus.SUBMITTED,
          toStatus: CollationResultStatus.REJECTED,
          comment: 'EC8A total does not match entered party votes — please recheck',
          hoursAgo: 5,
        });
      }

      puIndex += 1;
      seededPus += 1;
    }

    // Ward rollup status
    let wardStatus: RollupStatus = 'APPROVED';
    let rejectionReason: string | undefined;

    if (isAtafi) {
      // Primary demo: LGA returned the whole ward (ward-level return, not PU Returned filter)
      wardStatus = 'REJECTED';
      rejectionReason =
        'LGA review: recheck APC/PDP split on returned PUs and confirm EC8A photos before resubmitting';
    } else if (ward.id === incompleteWardId) {
      // Submitted to LGA but not all PUs approved → approve blocked by readiness gate
      wardStatus = 'SUBMITTED';
    } else if (wardIndex % 7 === 2) {
      wardStatus = 'SUBMITTED'; // Awaiting LGA, fully ready
    } else if (wardIndex % 11 === 4) {
      wardStatus = 'REJECTED';
      rejectionReason = 'Incomplete documentation on ward summary sheet';
    } else {
      wardStatus = 'APPROVED';
    }

    const wardRollup = await seedWardRollupFromPus(prisma, campaignId, ward.id, partyCodes, {
      status: wardStatus,
      approvedOnly: true,
      submittedById: wardOfficerId,
      approvedById: lgaOfficerId,
      rejectionReason,
    });

    if (wardRollup && wardOfficerId) {
      await writeSeedActionLog(prisma, {
        campaignId,
        collationResultId: wardRollup.resultId,
        action: CollationActionType.SUBMITTED,
        actorId: wardOfficerId,
        fromStatus: CollationResultStatus.DRAFT,
        toStatus: CollationResultStatus.SUBMITTED,
        hoursAgo: 9,
      });
    }
    if (wardRollup && lgaOfficerId && wardStatus === 'APPROVED') {
      await writeSeedActionLog(prisma, {
        campaignId,
        collationResultId: wardRollup.resultId,
        action: CollationActionType.APPROVED,
        actorId: lgaOfficerId,
        fromStatus: CollationResultStatus.SUBMITTED,
        toStatus: CollationResultStatus.APPROVED,
        comment: 'Ward totals verified at LGA',
        hoursAgo: 2,
      });
    }
    if (wardRollup && lgaOfficerId && wardStatus === 'REJECTED') {
      await writeSeedActionLog(prisma, {
        campaignId,
        collationResultId: wardRollup.resultId,
        action: CollationActionType.REJECTED,
        actorId: lgaOfficerId,
        fromStatus: CollationResultStatus.SUBMITTED,
        toStatus: CollationResultStatus.REJECTED,
        comment: rejectionReason,
        hoursAgo: 1,
      });
    }
  }

  // LGA rollup from approved wards only → status SUBMITTED (awaiting state)
  await seedLgaRollupFromWards(prisma, campaignId, hadejiaLgaId, partyCodes, {
    status: 'SUBMITTED',
    approvedOnly: true,
  });

  return {
    seededPus,
    seededWards: wards.length,
    atafiWardId,
    incompleteWardId,
  };
}

function resolvePuStatus(input: {
  isAtafi: boolean;
  isIncompleteWard: boolean;
  isDemoPu: boolean;
  puPos: number;
  wardPuCount: number;
  puIndex: number;
}): PuStatus {
  if (input.isDemoPu) {
    // Ward officer sees this first in default “Awaiting review”
    return 'SUBMITTED';
  }

  if (input.isAtafi) {
    // Spread statuses within ATAFI for ward filters / dashboard
    if (input.puPos === 1) return 'REJECTED';
    if (input.puPos === 2) return 'DRAFT';
    if (input.puPos === 3) return 'SUBMITTED';
    return 'APPROVED';
  }

  if (input.isIncompleteWard) {
    // Leave several PUs incomplete so LGA readiness gate fails
    if (input.puPos === 0) return 'APPROVED';
    if (input.puPos === 1) return 'SUBMITTED';
    if (input.puPos === 2) return 'DRAFT';
    if (input.puPos === 3) return 'REJECTED';
    return 'APPROVED';
  }

  // Default bulk: nearly all approved so LGA has volume of work
  if (input.puIndex % 23 === 0) return 'SUBMITTED';
  if (input.puIndex % 29 === 0) return 'REJECTED';
  return 'APPROVED';
}

export async function seedStateLgaSummaries(
  prisma: PrismaClient,
  campaignId: string,
  stateId: string,
  partyCodes: string[],
) {
  const lgas = await prisma.lGA.findMany({
    where: { stateId },
    orderBy: { name: 'asc' },
  });

  for (const [index, lga] of lgas.entries()) {
    const existing = await prisma.collationResult.findFirst({
      where: {
        campaignId,
        level: CollationLevel.LGA,
        scopeId: lga.id,
      },
    });

    if (existing) continue;

    const partyResults = generateSamplePartyResults(index + 10, partyCodes);
    const votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);

    await prisma.collationResult.create({
      data: {
        campaignId,
        level: CollationLevel.LGA,
        scopeType: ScopeType.LGA,
        scopeId: lga.id,
        partyResults,
        votesCast,
        status: CollationResultStatus.APPROVED,
      },
    });
  }
}
