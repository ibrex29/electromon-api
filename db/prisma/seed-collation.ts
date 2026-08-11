import type { PrismaClient } from '../src/generated/client';
import { ScopeType } from '../src/generated/client';

type PartyTotals = Record<string, number>;

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

interface SeedPuResultInput {
  puId: string;
  index: number;
  partyCodes: string[];
  submittedById?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
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

export async function seedPollingUnitResult(
  prisma: PrismaClient,
  campaignId: string,
  input: SeedPuResultInput,
) {
  const partyResults = generateSamplePartyResults(input.index, input.partyCodes);
  const votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);
  const registeredVoters = votesCast + 120 + (input.index % 80);

  await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: 'POLLING_UNIT',
        scopeType: ScopeType.POLLING_UNIT,
        scopeId: input.puId,
      },
    },
    update: {
      partyResults,
      votesCast,
      registeredVoters,
      accreditedVoters: votesCast + (input.index % 12),
      status: input.status ?? 'SUBMITTED',
    },
    create: {
      campaignId,
      level: 'POLLING_UNIT',
      scopeType: ScopeType.POLLING_UNIT,
      scopeId: input.puId,
      partyResults,
      votesCast,
      registeredVoters,
      accreditedVoters: votesCast + (input.index % 12),
      status: input.status ?? 'SUBMITTED',
      submittedById: input.submittedById,
      submittedAt: input.submittedById ? new Date() : undefined,
    },
  });

  return partyResults;
}

export async function seedWardRollupFromPus(
  prisma: PrismaClient,
  campaignId: string,
  wardId: string,
  partyCodes: string[],
  status: 'SUBMITTED' | 'APPROVED' = 'APPROVED',
) {
  const pus = await prisma.pollingUnit.findMany({
    where: { wardId },
    select: { id: true },
  });

  const puResults = await prisma.collationResult.findMany({
    where: {
      campaignId,
      level: 'POLLING_UNIT',
      scopeId: { in: pus.map((pu) => pu.id) },
    },
    select: { partyResults: true, votesCast: true },
  });

  if (puResults.length === 0) return null;

  const partyResults = sumPartyMaps(
    puResults.map((result) => (result.partyResults ?? {}) as PartyTotals),
  );
  const votesCast = puResults.reduce((sum, result) => sum + (result.votesCast ?? 0), 0);

  await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: 'WARD',
        scopeType: ScopeType.WARD,
        scopeId: wardId,
      },
    },
    update: { partyResults, votesCast, status },
    create: {
      campaignId,
      level: 'WARD',
      scopeType: ScopeType.WARD,
      scopeId: wardId,
      partyResults,
      votesCast,
      status,
    },
  });

  return partyResults;
}

export async function seedLgaRollupFromWards(
  prisma: PrismaClient,
  campaignId: string,
  lgaId: string,
  partyCodes: string[],
  status: 'SUBMITTED' | 'APPROVED' = 'APPROVED',
) {
  const wards = await prisma.ward.findMany({
    where: { lgaId },
    select: { id: true },
  });

  const wardResults = await prisma.collationResult.findMany({
    where: {
      campaignId,
      level: 'WARD',
      scopeId: { in: wards.map((ward) => ward.id) },
    },
    select: { partyResults: true, votesCast: true },
  });

  if (wardResults.length === 0) {
    const partyResults = generateSamplePartyResults(wards.length, partyCodes);
    const votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);
    await prisma.collationResult.upsert({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId,
          level: 'LGA',
          scopeType: ScopeType.LGA,
          scopeId: lgaId,
        },
      },
      update: { partyResults, votesCast, status },
      create: {
        campaignId,
        level: 'LGA',
        scopeType: ScopeType.LGA,
        scopeId: lgaId,
        partyResults,
        votesCast,
        status,
      },
    });
    return partyResults;
  }

  const partyResults = sumPartyMaps(
    wardResults.map((result) => (result.partyResults ?? {}) as PartyTotals),
  );
  const votesCast = wardResults.reduce((sum, result) => sum + (result.votesCast ?? 0), 0);

  await prisma.collationResult.upsert({
    where: {
      campaignId_level_scopeType_scopeId: {
        campaignId,
        level: 'LGA',
        scopeType: ScopeType.LGA,
        scopeId: lgaId,
      },
    },
    update: { partyResults, votesCast, status },
    create: {
      campaignId,
      level: 'LGA',
      scopeType: ScopeType.LGA,
      scopeId: lgaId,
      partyResults,
      votesCast,
      status,
    },
  });

  return partyResults;
}

export async function seedHadejiaCollationResults(
  prisma: PrismaClient,
  campaignId: string,
  hadejiaLgaId: string,
  partyCodes: string[],
  puOfficerId?: string,
) {
  const wards = await prisma.ward.findMany({
    where: { lgaId: hadejiaLgaId },
    include: { pollingUnits: { orderBy: { code: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  let puIndex = 0;
  let seededPus = 0;

  for (const ward of wards) {
    for (const pu of ward.pollingUnits) {
      await seedPollingUnitResult(prisma, campaignId, {
        puId: pu.id,
        index: puIndex,
        partyCodes,
        submittedById: puOfficerId,
        status: puIndex < 2 ? 'SUBMITTED' : 'APPROVED',
      });
      puIndex += 1;
      seededPus += 1;
    }

    await seedWardRollupFromPus(prisma, campaignId, ward.id, partyCodes);
  }

  await seedLgaRollupFromWards(prisma, campaignId, hadejiaLgaId, partyCodes);

  return { seededPus, seededWards: wards.length };
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
        level: 'LGA',
        scopeId: lga.id,
      },
    });

    if (existing) continue;

    const partyResults = generateSamplePartyResults(index + 10, partyCodes);
    const votesCast = Object.values(partyResults).reduce((sum, n) => sum + n, 0);

    await prisma.collationResult.create({
      data: {
        campaignId,
        level: 'LGA',
        scopeType: ScopeType.LGA,
        scopeId: lga.id,
        partyResults,
        votesCast,
        status: 'APPROVED',
      },
    });
  }
}
