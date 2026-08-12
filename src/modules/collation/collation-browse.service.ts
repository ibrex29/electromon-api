import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CampaignRole,
  CollationLevel,
  JwtPayload,
  ScopeType,
  TrackedParty,
  emptyPartyTotals,
  getCollationLevelForRole,
  getPartyCodes,
  normalizeTrackedParties,
  parsePartyTotals,
} from '@electromon/shared';
import { Prisma } from '@electromon/db';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface BrowseRow {
  id: string;
  name: string;
  code?: string;
  subtitle?: string;
  parties: Record<string, number>;
  totalVotes: number;
  href?: string;
}

export interface PaginatedBrowseResult {
  stateName: string;
  stateId: string;
  title: string;
  subtitle: string;
  level: 'LGA' | 'WARD' | 'POLLING_UNIT';
  parent?: { id: string; name: string; href?: string };
  trackedParties: TrackedParty[];
  clientPartyCode?: string | null;
  partyColumns: string[];
  data: BrowseRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class CollationBrowseService {
  constructor(private prisma: PrismaService) {}

  async getContext(user: JwtPayload) {
    if (!user.campaignId) {
      throw new ForbiddenException('Campaign membership required');
    }

    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: user.campaignId },
      include: { state: true },
    });

    const trackedParties = normalizeTrackedParties(campaign.trackedParties);
    const partyColumns = getPartyCodes(trackedParties);

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      stateId: campaign.state.id,
      stateName: campaign.state.name.toUpperCase(),
      stateCode: campaign.state.code,
      role: user.role,
      scopeType: user.scopeType,
      scopeId: user.scopeId,
      clientPartyCode: campaign.clientPartyCode,
      trackedParties,
      partyColumns,
    };
  }

  private async getCampaignPartyConfig(campaignId: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
    });
    const trackedParties = normalizeTrackedParties(campaign.trackedParties);
    return {
      trackedParties,
      clientPartyCode: campaign.clientPartyCode,
      partyColumns: getPartyCodes(trackedParties),
    };
  }

  private withPartyMeta<T extends object>(
    payload: T,
    partyConfig: Awaited<ReturnType<CollationBrowseService['getCampaignPartyConfig']>>,
  ) {
    return {
      ...payload,
      trackedParties: partyConfig.trackedParties,
      clientPartyCode: partyConfig.clientPartyCode,
      partyColumns: partyConfig.partyColumns,
    };
  }

  async browseLgas(user: JwtPayload, page = 1, limit = 20, search?: string) {
    const context = await this.getContext(user);
    const partyConfig = await this.getCampaignPartyConfig(user.campaignId!);
    if (this.isScopedToWard(user)) {
      throw new ForbiddenException('Ward officers can only access their assigned ward');
    }
    this.assertCanBrowseLevel(user, CollationLevel.LGA);

    const where: Prisma.LGAWhereInput = {
      stateId: context.stateId,
      ...(search
        ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {}),
    };

    if (this.isScopedToLga(user)) {
      where.id = user.scopeId!;
    }

    const [total, lgas] = await Promise.all([
      this.prisma.lGA.count({ where }),
      this.prisma.lGA.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const results = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId!,
        level: CollationLevel.LGA,
        scopeId: { in: lgas.map((l) => l.id) },
      },
    });

    const resultMap = new Map(results.map((r) => [r.scopeId, r]));

    return this.withPartyMeta(
      {
        stateName: context.stateName,
        stateId: context.stateId,
        title: context.stateName,
        subtitle: 'List of Local Governments',
        level: 'LGA' as const,
        data: lgas.map((lga, index) => {
          const parties = parsePartyTotals(
            resultMap.get(lga.id)?.partyResults,
            partyConfig.partyColumns,
          );
          return {
            id: lga.id,
            name: lga.name.toUpperCase(),
            parties,
            totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
            href: `/dashboard/lgas/${lga.id}`,
            subtitle: `#${(page - 1) * limit + index + 1}`,
          };
        }),
        meta: this.buildMeta(page, limit, total),
      },
      partyConfig,
    ) satisfies PaginatedBrowseResult;
  }

  async browseWards(user: JwtPayload, lgaId: string, page = 1, limit = 20, search?: string) {
    const context = await this.getContext(user);
    const partyConfig = await this.getCampaignPartyConfig(user.campaignId!);
    this.assertCanBrowseLevel(user, CollationLevel.WARD);

    const lga = await this.prisma.lGA.findFirst({
      where: { id: lgaId, stateId: context.stateId },
    });
    if (!lga) throw new NotFoundException('LGA not found');

    if (this.isScopedToLga(user) && user.scopeId !== lgaId) {
      throw new ForbiddenException('You can only browse wards in your assigned LGA');
    }

    const where: Prisma.WardWhereInput = {
      lgaId,
      ...(search
        ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {}),
    };

    if (this.isScopedToWard(user)) {
      where.id = user.scopeId!;
    }

    const [total, wards] = await Promise.all([
      this.prisma.ward.count({ where }),
      this.prisma.ward.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const results = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId!,
        level: CollationLevel.WARD,
        scopeId: { in: wards.map((w) => w.id) },
      },
    });
    const resultMap = new Map(results.map((r) => [r.scopeId, r]));

    return this.withPartyMeta(
      {
        stateName: context.stateName,
        stateId: context.stateId,
        title: lga.name.toUpperCase(),
        subtitle: this.isScopedToLga(user)
          ? 'Wards in your LGA'
          : `Wards in ${lga.name} LGA`,
        level: 'WARD' as const,
        // Parent is the LGA list (state level), never the same LGA you are already viewing.
        parent: this.isScopedToLga(user)
          ? undefined
          : {
              id: context.stateId,
              name: 'Local Governments',
              href: '/dashboard/lgas',
            },
        data: wards.map((ward, index) => {
          const parties = parsePartyTotals(
            resultMap.get(ward.id)?.partyResults,
            partyConfig.partyColumns,
          );
          return {
            id: ward.id,
            name: ward.name.toUpperCase(),
            parties,
            totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
            href: `/dashboard/wards/${ward.id}`,
            subtitle: ward.registrationAreaCode ?? `#${(page - 1) * limit + index + 1}`,
          };
        }),
        meta: this.buildMeta(page, limit, total),
      },
      partyConfig,
    ) satisfies PaginatedBrowseResult;
  }

  async browseWardsForUser(user: JwtPayload, page = 1, limit = 20, search?: string) {
    if (!this.isScopedToLga(user)) {
      throw new ForbiddenException('This endpoint is for LGA-scoped users');
    }
    return this.browseWards(user, user.scopeId!, page, limit, search);
  }

  async browsePollingUnits(
    user: JwtPayload,
    wardId: string,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    const context = await this.getContext(user);
    const partyConfig = await this.getCampaignPartyConfig(user.campaignId!);
    this.assertCanBrowseLevel(user, CollationLevel.POLLING_UNIT);

    const ward = await this.prisma.ward.findFirst({
      where: { id: wardId, lga: { stateId: context.stateId } },
      include: { lga: true },
    });
    if (!ward) throw new NotFoundException('Ward not found');

    if (this.isScopedToLga(user) && ward.lgaId !== user.scopeId) {
      throw new ForbiddenException('Ward is outside your LGA scope');
    }
    if (this.isScopedToWard(user) && user.scopeId !== wardId) {
      throw new ForbiddenException('You can only browse polling units in your assigned ward');
    }

    const where: Prisma.PollingUnitWhereInput = {
      wardId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    if (this.isScopedToPu(user)) {
      where.id = user.scopeId!;
    }

    const [total, pollingUnits] = await Promise.all([
      this.prisma.pollingUnit.count({ where }),
      this.prisma.pollingUnit.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const results = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId!,
        level: CollationLevel.POLLING_UNIT,
        scopeId: { in: pollingUnits.map((pu) => pu.id) },
      },
    });
    const resultMap = new Map(results.map((r) => [r.scopeId, r]));

    const parent = this.isScopedToWard(user)
      ? undefined
      : this.isScopedToLga(user)
        ? {
            id: ward.lga.id,
            name: `${ward.lga.name} LGA`,
            href: '/dashboard/my-lga',
          }
        : {
            id: ward.lga.id,
            name: `${ward.lga.name} LGA`,
            href: `/dashboard/lgas/${ward.lga.id}`,
          };

    return this.withPartyMeta(
      {
        stateName: context.stateName,
        stateId: context.stateId,
        title: ward.name.toUpperCase(),
        subtitle: this.isScopedToWard(user)
          ? `Polling stations · ${ward.lga.name} LGA`
          : `Polling stations · ${ward.lga.name} LGA`,
        level: 'POLLING_UNIT' as const,
        parent,
        data: pollingUnits.map((pu, index) => {
          const parties = parsePartyTotals(
            resultMap.get(pu.id)?.partyResults,
            partyConfig.partyColumns,
          );
          return {
            id: pu.id,
            name: pu.name.toUpperCase(),
            code: pu.code,
            parties,
            totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
            href: `/dashboard/my-unit?id=${pu.id}`,
            subtitle: pu.code ?? `#${(page - 1) * limit + index + 1}`,
          };
        }),
        meta: this.buildMeta(page, limit, total),
      },
      partyConfig,
    ) satisfies PaginatedBrowseResult;
  }

  async browsePollingUnitsForUser(user: JwtPayload, page = 1, limit = 20, search?: string) {
    if (this.isScopedToPu(user)) {
      if (!user.scopeId) {
        throw new ForbiddenException('No polling unit assigned to your account');
      }

      const partyConfig = await this.getCampaignPartyConfig(user.campaignId!);
      const context = await this.getContext(user);

      const where: Prisma.PollingUnitWhereInput = {
        id: user.scopeId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      };

      const pollingUnit = await this.prisma.pollingUnit.findFirst({
        where: { ...where, ward: { lga: { stateId: context.stateId } } },
        include: { ward: { include: { lga: true } } },
      });

      if (!pollingUnit) {
        throw new NotFoundException('Assigned polling unit not found');
      }

      const result = await this.prisma.collationResult.findFirst({
        where: {
          campaignId: user.campaignId!,
          level: CollationLevel.POLLING_UNIT,
          scopeId: pollingUnit.id,
        },
      });

      const parties = parsePartyTotals(result?.partyResults, partyConfig.partyColumns);

      return this.withPartyMeta(
        {
          stateName: context.stateName,
          stateId: context.stateId,
          title: pollingUnit.name.toUpperCase(),
          subtitle: `My polling unit · ${pollingUnit.ward.name} · ${pollingUnit.ward.lga.name} LGA`,
          level: 'POLLING_UNIT' as const,
          parent: undefined,
          data: [
            {
              id: pollingUnit.id,
              name: pollingUnit.name.toUpperCase(),
              code: pollingUnit.code,
              parties,
              totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
              href: `/dashboard/my-unit?id=${pollingUnit.id}`,
              subtitle: pollingUnit.code ?? pollingUnit.ward.name,
            },
          ],
          meta: this.buildMeta(page, limit, 1),
        },
        partyConfig,
      ) satisfies PaginatedBrowseResult;
    }

    if (this.isScopedToWard(user)) {
      return this.browsePollingUnits(user, user.scopeId!, page, limit, search);
    }
    if (this.isScopedToLga(user)) {
      const partyConfig = await this.getCampaignPartyConfig(user.campaignId!);
      const where: Prisma.PollingUnitWhereInput = {
        ward: { lgaId: user.scopeId! },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      };

      const [total, pollingUnits] = await Promise.all([
        this.prisma.pollingUnit.count({ where }),
        this.prisma.pollingUnit.findMany({
          where,
          orderBy: { code: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { ward: { include: { lga: true } } },
        }),
      ]);

      const results = await this.prisma.collationResult.findMany({
        where: {
          campaignId: user.campaignId!,
          level: CollationLevel.POLLING_UNIT,
          scopeId: { in: pollingUnits.map((pu) => pu.id) },
        },
      });
      const resultMap = new Map(results.map((r) => [r.scopeId, r]));
      const context = await this.getContext(user);

      return this.withPartyMeta(
        {
          stateName: context.stateName,
          stateId: context.stateId,
          title: pollingUnits[0]?.ward.lga.name.toUpperCase() ?? 'LGA',
          subtitle: 'Polling stations in your LGA',
          level: 'POLLING_UNIT' as const,
          parent: undefined,
          data: pollingUnits.map((pu) => {
            const parties = parsePartyTotals(
              resultMap.get(pu.id)?.partyResults,
              partyConfig.partyColumns,
            );
            return {
              id: pu.id,
              name: pu.name.toUpperCase(),
              code: pu.code,
              parties,
              totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
              href: `/dashboard/my-unit?id=${pu.id}`,
              subtitle: pu.ward.name,
            };
          }),
          meta: this.buildMeta(page, limit, total),
        },
        partyConfig,
      ) satisfies PaginatedBrowseResult;
    }

    throw new ForbiddenException('This endpoint is for ward or LGA scoped users');
  }

  private buildMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private assertCanBrowseLevel(user: JwtPayload, minLevel: CollationLevel) {
    const role = user.role as CampaignRole | undefined;
    const level = role ? getCollationLevelForRole(role) : undefined;

    if (!level && role !== CampaignRole.CAMPAIGN_DIRECTOR && role !== CampaignRole.CANDIDATE) {
      throw new ForbiddenException('Insufficient permissions to browse this level');
    }

    const order = [CollationLevel.POLLING_UNIT, CollationLevel.WARD, CollationLevel.LGA, CollationLevel.STATE, CollationLevel.NATIONAL];
    if (level && order.indexOf(level) < order.indexOf(minLevel)) {
      // PU officer can't browse LGAs - handled by scoped queries
    }
  }

  private isScopedToPu(user: JwtPayload) {
    return (
      user.scopeType === ScopeType.POLLING_UNIT || user.role === CampaignRole.POLLING_AGENT
    );
  }

  private isScopedToWard(user: JwtPayload) {
    return (
      user.scopeType === ScopeType.WARD || user.role === CampaignRole.WARD_RA_OFFICER
    );
  }

  private isScopedToLga(user: JwtPayload) {
    return (
      user.scopeType === ScopeType.LGA || user.role === CampaignRole.LGA_COLLATION_OFFICER
    );
  }
}
