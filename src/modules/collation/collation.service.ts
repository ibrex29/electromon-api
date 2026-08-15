import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CampaignRole,
  CollationLevel,
  CollationResultStatus,
  JwtPayload,
  NotificationType,
  ScopeType,
  getParentLevel,
  getCollationLevelForRole,
  isCampaignAdminRole,
} from '@electromon/shared';
import { Prisma } from '@electromon/db';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import { CreateCollationResultDto, RejectCollationResultDto, ApproveCollationResultDto } from './dto/collation.dto';
import {
  NOTIFICATION_DISPATCH_EVENT,
  NotificationDispatchPayload,
} from '../notifications/notification.events';

const EDITABLE_STATUSES = new Set<CollationResultStatus>([
  CollationResultStatus.DRAFT,
  CollationResultStatus.REJECTED,
]);

@Injectable()
export class CollationService {
  constructor(
    private prisma: PrismaService,
    private scopeResolver: ScopeResolverService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getDashboard(user: JwtPayload) {
    if (!user.role || !user.campaignId) {
      throw new ForbiddenException('No active campaign membership');
    }

    if (isCampaignAdminRole(user.role)) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: user.campaignId },
        include: { state: { select: { id: true, name: true } } },
      });
      if (!campaign) throw new ForbiddenException('Campaign not found');

      const submittedCount = await this.prisma.collationResult.count({
        where: {
          campaignId: user.campaignId,
          level: CollationLevel.LGA,
          status: CollationResultStatus.SUBMITTED,
        },
      });

      return {
        dashboard: {
          level: CollationLevel.STATE,
          levelLabel: 'Campaign Command (Admin)',
          levelOrder: 4,
          scopeType: ScopeType.STATE,
          scopeId: campaign.stateId,
          scopeName: campaign.state.name,
          canSubmit: false,
          canApprove: false,
          route: '/dashboard/lgas',
        },
        scopeChain: {
          state: { id: campaign.state.id, name: campaign.state.name },
        },
        pendingApprovals: submittedCount,
        myResult: null,
      };
    }

    const dashboard = await this.scopeResolver.buildDashboard(
      user.role as CampaignRole,
      user.scopeType as ScopeType,
      user.scopeId,
    );

    const level = getCollationLevelForRole(user.role as CampaignRole);
    const pendingApprovals = level
      ? await this.countPendingApprovals(user.campaignId, level, user.scopeType as ScopeType, user.scopeId)
      : 0;

    const myResult = level
      ? await this.prisma.collationResult.findFirst({
          where: {
            campaignId: user.campaignId,
            level,
            scopeType: user.scopeType as ScopeType,
            scopeId: user.scopeId ?? '',
          },
        })
      : null;

    return {
      dashboard,
      scopeChain: user.scopeType && user.scopeId
        ? await this.scopeResolver.resolveScopeChain(user.scopeType as ScopeType, user.scopeId)
        : null,
      pendingApprovals,
      myResult,
    };
  }

  async listResults(user: JwtPayload, status?: CollationResultStatus) {
    if (isCampaignAdminRole(user.role)) {
      if (!user.campaignId) {
        throw new ForbiddenException('No active campaign membership');
      }
      const where: Record<string, unknown> = {
        campaignId: user.campaignId,
        level: CollationLevel.LGA,
      };
      if (status) where.status = status;

      const rows = await this.prisma.collationResult.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        take: 200,
      });

      const lgaIds = [...new Set(rows.map((r) => r.scopeId).filter(Boolean))];
      const lgas = lgaIds.length
        ? await this.prisma.lGA.findMany({
            where: { id: { in: lgaIds } },
            select: { id: true, name: true },
          })
        : [];
      const lgaName = new Map(lgas.map((l) => [l.id, l.name]));

      return rows.map((r) => ({
        ...r,
        scopeName: lgaName.get(r.scopeId) ?? r.scopeId,
      }));
    }

    this.assertCollationUser(user);

    const level = getCollationLevelForRole(user.role as CampaignRole)!;
    const where: Record<string, unknown> = {
      campaignId: user.campaignId,
      level,
      scopeType: user.scopeType,
      scopeId: user.scopeId,
    };
    if (status) where.status = status;

    return this.prisma.collationResult.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async getPollingUnitResultForViewer(user: JwtPayload, pollingUnitId: string) {
    if (!user.campaignId || !user.role) {
      throw new ForbiddenException('No active campaign membership');
    }

    const pu = await this.prisma.pollingUnit.findUnique({
      where: { id: pollingUnitId },
      include: { ward: { include: { lga: { select: { id: true, stateId: true, name: true } } } } },
    });
    if (!pu) throw new NotFoundException('Polling unit not found');

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: user.campaignId },
      select: { stateId: true },
    });
    if (!campaign || pu.ward.lga.stateId !== campaign.stateId) {
      throw new ForbiddenException('Polling unit is outside your campaign state');
    }

    if (isCampaignAdminRole(user.role)) {
      // full state access
    } else if (
      user.role === CampaignRole.LGA_COLLATION_OFFICER ||
      user.scopeType === ScopeType.LGA
    ) {
      if (user.scopeId !== pu.ward.lgaId) {
        throw new ForbiddenException('Polling unit is outside your assigned LGA');
      }
    } else if (
      user.role === CampaignRole.WARD_RA_OFFICER ||
      user.scopeType === ScopeType.WARD
    ) {
      if (user.scopeId !== pu.wardId) {
        throw new ForbiddenException('Polling unit is outside your assigned ward');
      }
    } else if (
      user.role === CampaignRole.POLLING_AGENT ||
      user.scopeType === ScopeType.POLLING_UNIT
    ) {
      if (user.scopeId !== pollingUnitId) {
        throw new ForbiddenException('You can only view your assigned polling unit');
      }
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }

    const result = await this.prisma.collationResult.findFirst({
      where: {
        campaignId: user.campaignId,
        level: CollationLevel.POLLING_UNIT,
        scopeId: pollingUnitId,
      },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return {
      ...(result ?? {}),
      id: result?.id,
      status: result?.status ?? null,
      registeredVoters: result?.registeredVoters ?? null,
      accreditedVoters: result?.accreditedVoters ?? null,
      votesCast: result?.votesCast ?? null,
      invalidVotes: result?.invalidVotes ?? null,
      partyResults: result?.partyResults ?? null,
      rejectionReason: result?.rejectionReason ?? null,
      submittedAt: result?.submittedAt ?? null,
      ec8aPhotoUrls: result?.ec8aPhotoUrls ?? [],
      submittedBy: result?.submittedBy ?? null,
      approvedBy: result?.approvedBy ?? null,
      approvedAt: result?.approvedAt ?? null,
      level: result?.level ?? CollationLevel.POLLING_UNIT,
      scopeId: pollingUnitId,
      pollingUnit: {
        id: pu.id,
        name: pu.name,
        code: pu.code,
        wardId: pu.wardId,
        wardName: pu.ward.name,
        lgaName: pu.ward.lga.name,
      },
    };
  }

  async listPendingApprovals(user: JwtPayload) {
    this.assertCollationUser(user);
    const level = getCollationLevelForRole(user.role as CampaignRole)!;
    const subordinateLevel = getParentLevel(level);
    if (!subordinateLevel) {
      return [];
    }

    const childScopeIds = await this.getChildScopeIds(
      user.scopeType as ScopeType,
      user.scopeId!,
      subordinateLevel,
    );

    return this.enrichPuResults(
      await this.prisma.collationResult.findMany({
        where: {
          campaignId: user.campaignId,
          level: subordinateLevel,
          status: CollationResultStatus.SUBMITTED,
          scopeId: { in: childScopeIds },
        },
        orderBy: { submittedAt: 'asc' },
        include: {
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    );
  }

  async listWardPuSubmissions(
    user: JwtPayload,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: CollationResultStatus | 'NOT_STARTED';
    } = {},
  ) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.WARD || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for ward-scoped officers');
    }

    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(50, Math.max(1, options.limit ?? 10));
    const search = options.search?.trim();
    const statusFilter = options.status;

    const allPus = await this.prisma.pollingUnit.findMany({
      where: {
        wardId: user.scopeId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      },
      select: { id: true, code: true, name: true, wardId: true },
      orderBy: { code: 'asc' },
    });
    const allPuIds = allPus.map((pu) => pu.id);

    // Full-ward counts (ignore list search) for summary cards
    const wardAllPus = search
      ? await this.prisma.pollingUnit.findMany({
          where: { wardId: user.scopeId },
          select: { id: true },
        })
      : allPus;
    const wardPuIds = wardAllPus.map((pu) => pu.id);
    const totalPus = wardPuIds.length;

    const emptyCounts = {
      submitted: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      notStarted: 0,
      totalPus,
    };

    if (wardPuIds.length === 0 && allPuIds.length === 0) {
      return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
        statusCounts: emptyCounts,
        wardMeta: {
          returnedByLga: false,
          canReturnApprovedPus: false,
          canResubmitToLga: false,
          rejectionReason: null,
          flaggedPollingUnitIds: [] as string[],
          flaggedPollingUnits: [] as { id: string; code: string; name: string }[],
        },
      };
    }

    const [wardResults, listResults, wardResult] = await Promise.all([
      this.prisma.collationResult.findMany({
        where: {
          campaignId: user.campaignId,
          level: CollationLevel.POLLING_UNIT,
          scopeId: { in: wardPuIds },
        },
        select: { scopeId: true, status: true },
      }),
      allPuIds.length === 0
        ? Promise.resolve([])
        : this.prisma.collationResult.findMany({
            where: {
              campaignId: user.campaignId,
              level: CollationLevel.POLLING_UNIT,
              scopeId: { in: allPuIds },
            },
            include: {
              submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
              approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          }),
      this.prisma.collationResult.findUnique({
        where: {
          campaignId_level_scopeType_scopeId: {
            campaignId: user.campaignId!,
            level: CollationLevel.WARD,
            scopeType: ScopeType.WARD,
            scopeId: user.scopeId,
          },
        },
        select: {
          status: true,
          rejectionReason: true,
          flaggedPollingUnitIds: true,
        },
      }),
    ]);

    const countByStatus = (rows: { status: string }[]) => {
      let submitted = 0;
      let approved = 0;
      let rejected = 0;
      let draft = 0;
      for (const row of rows) {
        if (row.status === 'SUBMITTED') submitted += 1;
        else if (row.status === 'APPROVED') approved += 1;
        else if (row.status === 'REJECTED') rejected += 1;
        else if (row.status === 'DRAFT') draft += 1;
      }
      const notStarted = Math.max(0, totalPus - submitted - approved - rejected - draft);
      return { submitted, approved, rejected, draft, notStarted, totalPus };
    };

    const statusCounts = countByStatus(wardResults);

    type RowStatus = CollationResultStatus | 'NOT_STARTED';
    const resultByPu = new Map(listResults.map((r) => [r.scopeId, r]));

    const rows: Array<{
      status: RowStatus;
      result: (typeof listResults)[number] | null;
      pollingUnit: (typeof allPus)[number];
    }> = [];

    for (const pu of allPus) {
      const result = resultByPu.get(pu.id) ?? null;
      const status: RowStatus = result
        ? (result.status as CollationResultStatus)
        : 'NOT_STARTED';
      if (statusFilter && status !== statusFilter) continue;
      rows.push({ status, result, pollingUnit: pu });
    }

    const flaggedIds = wardResult?.flaggedPollingUnitIds ?? [];
    // Prefer LGA-flagged, then actionable statuses
    const flaggedSet = new Set(flaggedIds);
    const statusOrder: Record<string, number> = {
      SUBMITTED: 0,
      REJECTED: 1,
      DRAFT: 2,
      NOT_STARTED: 3,
      APPROVED: 4,
    };
    rows.sort((a, b) => {
      const aFlagged = flaggedSet.has(a.pollingUnit.id) ? 0 : 1;
      const bFlagged = flaggedSet.has(b.pollingUnit.id) ? 0 : 1;
      if (aFlagged !== bFlagged) return aFlagged - bFlagged;
      const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return a.pollingUnit.code.localeCompare(b.pollingUnit.code);
    });

    const total = rows.length;
    const pageRows = rows.slice((page - 1) * limit, page * limit);

    const data = pageRows.map(({ result, pollingUnit }) => {
      if (result) {
        return { ...result, pollingUnit, flaggedByLga: flaggedSet.has(pollingUnit.id) };
      }
      return {
        id: `not-started:${pollingUnit.id}`,
        campaignId: user.campaignId!,
        level: CollationLevel.POLLING_UNIT,
        scopeType: ScopeType.POLLING_UNIT,
        scopeId: pollingUnit.id,
        registeredVoters: null,
        accreditedVoters: null,
        votesCast: null,
        invalidVotes: null,
        partyResults: null,
        ec8aPhotoUrls: [] as string[],
        approvalComment: null,
        status: 'NOT_STARTED' as const,
        submittedById: null,
        submittedAt: null,
        approvedById: null,
        approvedAt: null,
        rejectionReason: null,
        parentResultId: null,
        createdAt: null,
        updatedAt: null,
        submittedBy: null,
        approvedBy: null,
        pollingUnit,
        flaggedByLga: flaggedSet.has(pollingUnit.id),
      };
    });

    const returnedByLga = wardResult?.status === CollationResultStatus.REJECTED;
    const allPusApproved =
      statusCounts.totalPus > 0 && statusCounts.approved === statusCounts.totalPus;

    const flaggedPollingUnits =
      flaggedIds.length > 0
        ? await this.prisma.pollingUnit.findMany({
            where: { id: { in: flaggedIds }, wardId: user.scopeId },
            select: { id: true, code: true, name: true },
            orderBy: { code: 'asc' },
          })
        : [];

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
      statusCounts,
      wardMeta: {
        returnedByLga,
        canReturnApprovedPus: returnedByLga,
        canResubmitToLga: returnedByLga && allPusApproved,
        rejectionReason: wardResult?.rejectionReason ?? null,
        flaggedPollingUnitIds: flaggedIds,
        flaggedPollingUnits,
      },
    };
  }

  async listLgaWardSubmissions(user: JwtPayload) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.LGA || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for LGA-scoped collation officers');
    }

    const wards = await this.prisma.ward.findMany({
      where: { lgaId: user.scopeId },
      select: { id: true, name: true, registrationAreaCode: true, lgaId: true },
      orderBy: { name: 'asc' },
    });
    const wardIds = wards.map((w) => w.id);

    if (wardIds.length === 0) {
      return { totalWards: 0, data: [] };
    }

    const results = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId,
        level: CollationLevel.WARD,
        scopeId: { in: wardIds },
      },
      orderBy: { submittedAt: 'desc' },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const resultByWard = new Map(results.map((r) => [r.scopeId, r]));
    const readinessByWard = await this.getWardPuReadinessMap(user.campaignId!, wardIds);

    const emptyReadiness = {
      totalPus: 0,
      approvedPus: 0,
      submittedPus: 0,
      rejectedPus: 0,
      missingPus: 0,
      readyForLgaApproval: false,
    };

    const data = wards.map((ward) => {
      const result = resultByWard.get(ward.id);
      const puReadiness = readinessByWard.get(ward.id) ?? { ...emptyReadiness };
      if (!result) {
        return {
          id: `not-started:${ward.id}`,
          campaignId: user.campaignId!,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: ward.id,
          registeredVoters: null,
          accreditedVoters: null,
          votesCast: null,
          invalidVotes: null,
          partyResults: null,
          ec8aPhotoUrls: [] as string[],
          approvalComment: null,
          status: 'NOT_STARTED' as const,
          submittedById: null,
          submittedAt: null,
          approvedById: null,
          approvedAt: null,
          rejectionReason: null,
          parentResultId: null,
          createdAt: null,
          updatedAt: null,
          submittedBy: null,
          approvedBy: null,
          ward,
          puReadiness,
        };
      }

      return {
        ...result,
        ward,
        puReadiness,
      };
    });

    const statusOrder: Record<string, number> = {
      SUBMITTED: 0,
      REJECTED: 1,
      DRAFT: 2,
      NOT_STARTED: 3,
      APPROVED: 4,
    };
    data.sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return (a.ward?.name ?? '').localeCompare(b.ward?.name ?? '');
    });

    return {
      totalWards: wardIds.length,
      data,
    };
  }

  async listLgaWardPuResults(user: JwtPayload, wardId: string) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.LGA || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for LGA-scoped collation officers');
    }

    const ward = await this.prisma.ward.findFirst({
      where: { id: wardId, lgaId: user.scopeId },
      select: { id: true },
    });
    if (!ward) {
      throw new ForbiddenException('This ward is outside your LGA');
    }

    const puIds = await this.getChildScopeIds(
      ScopeType.WARD,
      wardId,
      CollationLevel.POLLING_UNIT,
    );

    return this.enrichPuResults(
      await this.prisma.collationResult.findMany({
        where: {
          campaignId: user.campaignId,
          level: CollationLevel.POLLING_UNIT,
          scopeId: { in: puIds },
          status: {
            in: [
              CollationResultStatus.SUBMITTED,
              CollationResultStatus.APPROVED,
              CollationResultStatus.REJECTED,
            ],
          },
        },
        orderBy: { submittedAt: 'desc' },
        include: {
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    );
  }

  async getLgaPuResult(user: JwtPayload, puId: string) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.LGA || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for LGA-scoped collation officers');
    }

    const unit = await this.prisma.pollingUnit.findFirst({
      where: { id: puId, ward: { lgaId: user.scopeId } },
      select: { id: true },
    });
    if (!unit) {
      throw new ForbiddenException('This polling unit is outside your LGA');
    }

    const result = await this.prisma.collationResult.findFirst({
      where: {
        campaignId: user.campaignId,
        level: CollationLevel.POLLING_UNIT,
        scopeId: puId,
      },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!result) return null;

    const enriched = await this.enrichPuResults([result]);
    return enriched[0] ?? null;
  }

  async approveAllLgaWardResults(user: JwtPayload, dto: ApproveCollationResultDto = {}) {
    this.assertCollationUser(user);
    if (user.role !== CampaignRole.LGA_COLLATION_OFFICER) {
      throw new ForbiddenException('Only the LGA collation officer can approve ward results');
    }
    if (user.scopeType !== ScopeType.LGA || !user.scopeId) {
      throw new ForbiddenException('LGA scope required');
    }

    const wardIds = await this.getChildScopeIds(
      ScopeType.LGA,
      user.scopeId,
      CollationLevel.WARD,
    );

    const pending = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId,
        level: CollationLevel.WARD,
        scopeId: { in: wardIds },
        status: CollationResultStatus.SUBMITTED,
      },
    });

    if (pending.length === 0) {
      throw new BadRequestException('No ward results are awaiting approval');
    }

    for (const result of pending) {
      await this.assertAllPollingUnitsApprovedInWard(user.campaignId!, result.scopeId);
    }

    const approvedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.collationResult.updateMany({
        where: { id: { in: pending.map((r) => r.id) } },
        data: {
          status: CollationResultStatus.APPROVED,
          approvedById: user.sub,
          approvedAt,
          approvalComment: dto.comment ?? null,
        },
      }),
      this.prisma.collationActionLog.createMany({
        data: pending.map((result) => ({
          campaignId: result.campaignId,
          collationResultId: result.id,
          action: 'APPROVED',
          actorId: user.sub,
          fromStatus: CollationResultStatus.SUBMITTED,
          toStatus: CollationResultStatus.APPROVED,
          comment: dto.comment ?? null,
          metadata: {
            bulk: true,
            level: result.level,
            scopeType: result.scopeType,
            scopeId: result.scopeId,
          },
        })),
      }),
    ]);

    await this.rollupToParent(
      user.campaignId!,
      CollationLevel.LGA,
      ScopeType.LGA,
      user.scopeId,
      user.sub,
    );

    return {
      approvedCount: pending.length,
      wardIds: pending.map((r) => r.scopeId),
    };
  }

  private async enrichWardResults<
    T extends { scopeId: string; level: string },
  >(results: T[]) {
    if (results.length === 0) return [];

    const wardIds = results
      .filter((r) => r.level === CollationLevel.WARD)
      .map((r) => r.scopeId);

    const wards = wardIds.length
      ? await this.prisma.ward.findMany({
          where: { id: { in: wardIds } },
          select: { id: true, name: true, registrationAreaCode: true, lgaId: true },
        })
      : [];

    const wardMap = new Map(wards.map((w) => [w.id, w]));

    return results.map((result) => ({
      ...result,
      ward: wardMap.get(result.scopeId) ?? null,
    }));
  }

  private async enrichPuResults<
    T extends { scopeId: string; level: string },
  >(results: T[]) {
    if (results.length === 0) return [];

    const puIds = results
      .filter((r) => r.level === CollationLevel.POLLING_UNIT)
      .map((r) => r.scopeId);

    const units = puIds.length
      ? await this.prisma.pollingUnit.findMany({
          where: { id: { in: puIds } },
          select: { id: true, code: true, name: true, wardId: true },
        })
      : [];

    const unitMap = new Map(units.map((u) => [u.id, u]));

    return results.map((result) => ({
      ...result,
      pollingUnit: unitMap.get(result.scopeId) ?? null,
    }));
  }

  async upsertResult(user: JwtPayload, dto: CreateCollationResultDto) {
    this.assertCollationUser(user);
    const level = getCollationLevelForRole(user.role as CampaignRole)!;

    if (level === CollationLevel.WARD) {
      throw new ForbiddenException(
        'Ward officers review and approve PU results. Ward totals are rolled up automatically.',
      );
    }

    const existing = await this.prisma.collationResult.findUnique({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId: user.campaignId!,
          level,
          scopeType: user.scopeType as ScopeType,
          scopeId: user.scopeId!,
        },
      },
    });

    if (existing && !EDITABLE_STATUSES.has(existing.status as CollationResultStatus)) {
      throw new BadRequestException(
        'This result has already been submitted. Wait for approval or a return for correction.',
      );
    }

    const ec8aPhotoUrls =
      dto.ec8aPhotoUrls !== undefined
        ? dto.ec8aPhotoUrls
        : existing?.ec8aPhotoUrls ?? [];

    const result = await this.prisma.collationResult.upsert({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId: user.campaignId!,
          level,
          scopeType: user.scopeType as ScopeType,
          scopeId: user.scopeId!,
        },
      },
      create: {
        campaignId: user.campaignId!,
        level,
        scopeType: user.scopeType as ScopeType,
        scopeId: user.scopeId!,
        registeredVoters: dto.registeredVoters,
        accreditedVoters: dto.accreditedVoters,
        votesCast: dto.votesCast,
        invalidVotes: dto.invalidVotes,
        partyResults: dto.partyResults,
        ec8aPhotoUrls,
        status: CollationResultStatus.DRAFT,
      },
      update: {
        registeredVoters: dto.registeredVoters,
        accreditedVoters: dto.accreditedVoters,
        votesCast: dto.votesCast,
        invalidVotes: dto.invalidVotes,
        partyResults: dto.partyResults,
        ec8aPhotoUrls,
        status: CollationResultStatus.DRAFT,
        rejectionReason: null,
      },
    });

    return result;
  }

  async attachEc8aPhoto(user: JwtPayload, id: string, photoUrl: string) {
    this.assertCollationUser(user);
    const result = await this.getOwnedResult(user, id);

    if (!EDITABLE_STATUSES.has(result.status as CollationResultStatus)) {
      throw new BadRequestException(
        'EC8A can only be uploaded while the result is a draft or returned for correction',
      );
    }

    const ec8aPhotoUrls = [...(result.ec8aPhotoUrls ?? []), photoUrl];

    return this.prisma.collationResult.update({
      where: { id },
      data: { ec8aPhotoUrls },
    });
  }

  async submitResult(user: JwtPayload, id: string) {
    this.assertCollationUser(user);
    const level = getCollationLevelForRole(user.role as CampaignRole)!;

    if (level === CollationLevel.WARD) {
      throw new ForbiddenException(
        'Ward results are forwarded to the LGA automatically when PU results are approved.',
      );
    }

    const result = await this.getOwnedResult(user, id);

    if (result.status === CollationResultStatus.APPROVED) {
      throw new BadRequestException('Result is already approved');
    }

    if (result.status === CollationResultStatus.SUBMITTED) {
      throw new BadRequestException('Result is already submitted and awaiting approval');
    }

    if (!EDITABLE_STATUSES.has(result.status as CollationResultStatus)) {
      throw new BadRequestException('Only draft or returned results can be submitted');
    }

    if (
      result.level === CollationLevel.POLLING_UNIT &&
      (!result.ec8aPhotoUrls || result.ec8aPhotoUrls.length === 0)
    ) {
      throw new BadRequestException(
        'EC8A form must be uploaded before submission. Save figures as draft until the form is attached.',
      );
    }

    const fromStatus = result.status as CollationResultStatus;

    const submitted = await this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.SUBMITTED,
        submittedById: user.sub,
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });

    const log = await this.writeActionLog({
      campaignId: submitted.campaignId,
      collationResultId: submitted.id,
      action: 'SUBMITTED',
      actorId: user.sub,
      fromStatus,
      toStatus: CollationResultStatus.SUBMITTED,
      metadata: {
        level: submitted.level,
        scopeType: submitted.scopeType,
        scopeId: submitted.scopeId,
      },
    });

    if (submitted.level === CollationLevel.POLLING_UNIT) {
      this.emitNotification({
        type: NotificationType.RESULT_SUBMITTED,
        campaignId: submitted.campaignId,
        actorUserId: user.sub,
        entityType: 'COLLATION_RESULT',
        entityId: submitted.id,
        sourceEventId: log.id,
        sendPush: true,
        collationResult: {
          level: submitted.level,
          scopeType: submitted.scopeType,
          scopeId: submitted.scopeId,
          submittedById: submitted.submittedById,
        },
      });
    }

    return submitted;
  }

  async approveResult(user: JwtPayload, id: string, dto: ApproveCollationResultDto = {}) {
    this.assertCollationUser(user);
    const level = getCollationLevelForRole(user.role as CampaignRole)!;
    const subordinateLevel = getParentLevel(level);
    if (!subordinateLevel) {
      throw new BadRequestException('This level cannot approve subordinate results');
    }

    const result = await this.prisma.collationResult.findUniqueOrThrow({ where: { id } });
    if (result.status !== CollationResultStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted results can be approved');
    }
    if (result.level !== subordinateLevel) {
      throw new ForbiddenException('You can only approve results from the level below yours');
    }

    await this.verifyApproverScope(user, result);

    if (result.level === CollationLevel.WARD) {
      await this.assertAllPollingUnitsApprovedInWard(user.campaignId!, result.scopeId);
    }

    const approved = await this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.APPROVED,
        approvedById: user.sub,
        approvedAt: new Date(),
        approvalComment: dto.comment ?? null,
        rejectionReason: null,
        flaggedPollingUnitIds: [],
      },
    });

    const log = await this.writeActionLog({
      campaignId: approved.campaignId,
      collationResultId: approved.id,
      action: 'APPROVED',
      actorId: user.sub,
      fromStatus: CollationResultStatus.SUBMITTED,
      toStatus: CollationResultStatus.APPROVED,
      comment: dto.comment ?? null,
      metadata: {
        level: approved.level,
        scopeType: approved.scopeType,
        scopeId: approved.scopeId,
      },
    });

    if (approved.level === CollationLevel.POLLING_UNIT) {
      this.emitNotification({
        type: NotificationType.RESULT_APPROVED,
        campaignId: approved.campaignId,
        actorUserId: user.sub,
        entityType: 'COLLATION_RESULT',
        entityId: approved.id,
        sourceEventId: log.id,
        sendPush: true,
        collationResult: {
          level: approved.level,
          scopeType: approved.scopeType,
          scopeId: approved.scopeId,
          submittedById: approved.submittedById,
        },
      });
    }

    // Roll up approved figures into this level's result draft
    await this.rollupToParent(
      user.campaignId!,
      level,
      user.scopeType as ScopeType,
      user.scopeId!,
      user.sub,
    );

    return approved;
  }

  async rejectResult(user: JwtPayload, id: string, dto: RejectCollationResultDto) {
    this.assertCollationUser(user);
    const result = await this.prisma.collationResult.findUniqueOrThrow({ where: { id } });
    const fromStatus = result.status as CollationResultStatus;

    // Standard path: return a submitted subordinate result
    // LGA-return recovery path: ward may re-return already-approved PUs while the ward rollup is REJECTED
    const isSubmitted = fromStatus === CollationResultStatus.SUBMITTED;
    const canReturnApprovedAfterLga =
      fromStatus === CollationResultStatus.APPROVED &&
      result.level === CollationLevel.POLLING_UNIT &&
      (await this.isWardReturnedByLga(result.campaignId, result.scopeId));

    if (!isSubmitted && !canReturnApprovedAfterLga) {
      if (fromStatus === CollationResultStatus.APPROVED) {
        throw new BadRequestException(
          'Approved PUs can only be returned after LGA has returned your ward rollup for correction',
        );
      }
      throw new BadRequestException('Only submitted results can be rejected');
    }

    await this.verifyApproverScope(user, result);

    let flaggedPollingUnitIds: string[] = [];
    const isLgaReturningWard =
      isSubmitted &&
      result.level === CollationLevel.WARD &&
      getCollationLevelForRole(user.role as CampaignRole) === CollationLevel.LGA;

    if (isLgaReturningWard && dto.affectedPollingUnitIds?.length) {
      flaggedPollingUnitIds = await this.validatePuIdsInWard(
        result.scopeId,
        dto.affectedPollingUnitIds,
      );
    }

    const rejected = await this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.REJECTED,
        rejectionReason: dto.reason,
        approvedById: user.sub,
        approvedAt: new Date(),
        approvalComment: null,
        ...(isLgaReturningWard
          ? { flaggedPollingUnitIds }
          : {}),
      },
    });

    const log = await this.writeActionLog({
      campaignId: rejected.campaignId,
      collationResultId: rejected.id,
      action: 'REJECTED',
      actorId: user.sub,
      fromStatus,
      toStatus: CollationResultStatus.REJECTED,
      comment: dto.reason,
      metadata: {
        level: rejected.level,
        scopeType: rejected.scopeType,
        scopeId: rejected.scopeId,
        afterLgaReturn: canReturnApprovedAfterLga,
        affectedPollingUnitIds: flaggedPollingUnitIds,
      },
    });

    if (rejected.level === CollationLevel.POLLING_UNIT) {
      this.emitNotification({
        type: NotificationType.RESULT_RETURNED,
        campaignId: rejected.campaignId,
        actorUserId: user.sub,
        entityType: 'COLLATION_RESULT',
        entityId: rejected.id,
        sourceEventId: log.id,
        sendPush: true,
        collationResult: {
          level: rejected.level,
          scopeType: rejected.scopeType,
          scopeId: rejected.scopeId,
          submittedById: rejected.submittedById,
        },
      });
    } else if (rejected.level === CollationLevel.WARD) {
      this.emitNotification({
        type: NotificationType.WARD_RETURNED_BY_LGA,
        campaignId: rejected.campaignId,
        actorUserId: user.sub,
        entityType: 'COLLATION_RESULT',
        entityId: rejected.id,
        sourceEventId: log.id,
        sendPush: true,
        collationResult: {
          level: rejected.level,
          scopeType: rejected.scopeType,
          scopeId: rejected.scopeId,
          submittedById: rejected.submittedById,
        },
      });
    }

    // Pull returned PU out of the ward rollup totals (keep ward REJECTED — do not re-forward)
    if (canReturnApprovedAfterLga) {
      await this.rebuildWardRollupAfterPuChange(user.campaignId!, user.scopeId!, {
        keepRejected: true,
        rejectionReasonPreserved: true,
        submittedById: user.sub,
      });
    }

    return rejected;
  }

  /**
   * After LGA returns a ward: re-forward ward totals once every PU is APPROVED again
   * (or still approved), without requiring a manual PU re-approve cycle.
   */
  async resubmitWardToLga(user: JwtPayload) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.WARD || !user.scopeId) {
      throw new ForbiddenException('Only ward officers can resubmit a ward rollup to LGA');
    }

    const level = getCollationLevelForRole(user.role as CampaignRole);
    if (level !== CollationLevel.WARD) {
      throw new ForbiddenException('Only ward officers can resubmit a ward rollup to LGA');
    }

    const wardResult = await this.prisma.collationResult.findUnique({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId: user.campaignId!,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: user.scopeId,
        },
      },
    });

    if (!wardResult) {
      throw new BadRequestException('No ward rollup exists yet. Approve PU results first.');
    }
    if (wardResult.status !== CollationResultStatus.REJECTED) {
      throw new BadRequestException('Ward rollup can only be re-submitted after LGA has returned it');
    }

    await this.assertAllPollingUnitsApprovedInWard(user.campaignId!, user.scopeId);

    const updated = await this.rebuildWardRollupAfterPuChange(user.campaignId!, user.scopeId, {
      forceSubmit: true,
      submittedById: user.sub,
      clearRejection: true,
    });

    if (updated) {
      const log = await this.writeActionLog({
        campaignId: updated.campaignId,
        collationResultId: updated.id,
        action: 'SUBMITTED',
        actorId: user.sub,
        fromStatus: CollationResultStatus.REJECTED,
        toStatus: CollationResultStatus.SUBMITTED,
        comment: 'Re-submitted to LGA after reviewing ward totals',
        metadata: { level: updated.level, scopeType: updated.scopeType, scopeId: updated.scopeId },
      });
      this.emitNotification({
        type: NotificationType.WARD_FORWARDED_TO_LGA,
        campaignId: updated.campaignId,
        actorUserId: user.sub,
        entityType: 'COLLATION_RESULT',
        entityId: updated.id,
        sourceEventId: log.id,
        sendPush: false,
        collationResult: {
          level: updated.level,
          scopeType: updated.scopeType,
          scopeId: updated.scopeId,
          submittedById: updated.submittedById,
        },
      });
    }

    return updated;
  }

  /**
   * Return every LGA-flagged PU to the agent (after LGA returned the ward).
   * Only PUs still APPROVED (or SUBMITTED) are returned.
   */
  async returnLgaFlaggedPus(user: JwtPayload, dto: RejectCollationResultDto) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.WARD || !user.scopeId) {
      throw new ForbiddenException('Only ward officers can return LGA-flagged PUs');
    }

    const wardResult = await this.prisma.collationResult.findUnique({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId: user.campaignId!,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: user.scopeId,
        },
      },
    });

    if (!wardResult || wardResult.status !== CollationResultStatus.REJECTED) {
      throw new BadRequestException('LGA must return this ward before bulk-returning flagged PUs');
    }

    const flaggedIds = wardResult.flaggedPollingUnitIds ?? [];
    if (flaggedIds.length === 0) {
      throw new BadRequestException('LGA did not flag any polling units on this return');
    }

    const reason =
      dto.reason?.trim() ||
      wardResult.rejectionReason ||
      'Returned by ward after LGA flagged this unit for correction';

    const results = await this.prisma.collationResult.findMany({
      where: {
        campaignId: user.campaignId,
        level: CollationLevel.POLLING_UNIT,
        scopeId: { in: flaggedIds },
        status: {
          in: [CollationResultStatus.APPROVED, CollationResultStatus.SUBMITTED],
        },
      },
    });

    let returnedCount = 0;
    for (const puResult of results) {
      await this.rejectResult(user, puResult.id, { reason });
      returnedCount += 1;
    }

    return {
      returnedCount,
      flaggedCount: flaggedIds.length,
      reason,
    };
  }

  private async validatePuIdsInWard(wardId: string, puIds: string[]): Promise<string[]> {
    const unique = [...new Set(puIds.map((id) => id.trim()).filter(Boolean))];
    if (unique.length === 0) return [];

    const valid = await this.prisma.pollingUnit.findMany({
      where: { id: { in: unique }, wardId },
      select: { id: true },
    });
    const validIds = new Set(valid.map((p) => p.id));
    const invalid = unique.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Some polling units are not in this ward: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`,
      );
    }
    return unique;
  }

  private async isWardReturnedByLga(campaignId: string, pollingUnitId: string): Promise<boolean> {
    const pu = await this.prisma.pollingUnit.findUnique({
      where: { id: pollingUnitId },
      select: { wardId: true },
    });
    if (!pu?.wardId) return false;

    const wardResult = await this.prisma.collationResult.findUnique({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: pu.wardId,
        },
      },
      select: { status: true },
    });

    return wardResult?.status === CollationResultStatus.REJECTED;
  }

  /**
   * Rebuild ward totals from currently APPROVED PUs.
   * - forceSubmit: set SUBMITTED (resend to LGA)
   * - keepRejected: remain REJECTED with refreshed totals
   */
  private async rebuildWardRollupAfterPuChange(
    campaignId: string,
    wardId: string,
    options: {
      forceSubmit?: boolean;
      keepRejected?: boolean;
      clearRejection?: boolean;
      rejectionReasonPreserved?: boolean;
      submittedById?: string;
    } = {},
  ) {
    const existing = await this.prisma.collationResult.findUnique({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: wardId,
        },
      },
    });

    const puIds = await this.getChildScopeIds(ScopeType.WARD, wardId, CollationLevel.POLLING_UNIT);
    const approvedChildren = await this.prisma.collationResult.findMany({
      where: {
        campaignId,
        level: CollationLevel.POLLING_UNIT,
        scopeId: { in: puIds },
        status: CollationResultStatus.APPROVED,
      },
    });

    const totals = approvedChildren.reduce(
      (acc, r) => ({
        registeredVoters: (acc.registeredVoters ?? 0) + (r.registeredVoters ?? 0),
        accreditedVoters: (acc.accreditedVoters ?? 0) + (r.accreditedVoters ?? 0),
        votesCast: (acc.votesCast ?? 0) + (r.votesCast ?? 0),
        invalidVotes: (acc.invalidVotes ?? 0) + (r.invalidVotes ?? 0),
      }),
      { registeredVoters: 0, accreditedVoters: 0, votesCast: 0, invalidVotes: 0 },
    );
    const partyResults = this.aggregatePartyResults(approvedChildren);

    let status: CollationResultStatus;
    if (options.forceSubmit) {
      status = CollationResultStatus.SUBMITTED;
    } else if (options.keepRejected || existing?.status === CollationResultStatus.REJECTED) {
      status = CollationResultStatus.REJECTED;
    } else {
      status = CollationResultStatus.SUBMITTED;
    }

    const rejectionReason =
      options.clearRejection
        ? null
        : options.rejectionReasonPreserved
          ? (existing?.rejectionReason ?? null)
          : status === CollationResultStatus.REJECTED
            ? (existing?.rejectionReason ?? null)
            : null;

    const flaggedPollingUnitIds =
      status === CollationResultStatus.REJECTED
        ? (existing?.flaggedPollingUnitIds ?? [])
        : [];

    return this.prisma.collationResult.upsert({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId,
          level: CollationLevel.WARD,
          scopeType: ScopeType.WARD,
          scopeId: wardId,
        },
      },
      create: {
        campaignId,
        level: CollationLevel.WARD,
        scopeType: ScopeType.WARD,
        scopeId: wardId,
        ...totals,
        partyResults,
        status,
        submittedById: options.submittedById,
        submittedAt: status === CollationResultStatus.SUBMITTED ? new Date() : undefined,
        rejectionReason,
        flaggedPollingUnitIds,
      },
      update: {
        ...totals,
        partyResults,
        status,
        submittedById:
          status === CollationResultStatus.SUBMITTED
            ? (options.submittedById ?? existing?.submittedById)
            : existing?.submittedById,
        submittedAt: status === CollationResultStatus.SUBMITTED ? new Date() : existing?.submittedAt,
        rejectionReason,
        flaggedPollingUnitIds,
        approvalComment: status === CollationResultStatus.SUBMITTED ? null : existing?.approvalComment,
        approvedById: status === CollationResultStatus.SUBMITTED ? null : existing?.approvedById,
        approvedAt: status === CollationResultStatus.SUBMITTED ? null : existing?.approvedAt,
      },
    });
  }

  async listActionLogs(user: JwtPayload, resultId: string) {
    if (!user.campaignId || !user.role) {
      throw new ForbiddenException('No active campaign membership');
    }

    const result = await this.prisma.collationResult.findUnique({ where: { id: resultId } });
    if (!result) throw new NotFoundException('Collation result not found');
    if (result.campaignId !== user.campaignId) {
      throw new ForbiddenException('Result is outside your campaign');
    }

    if (!isCampaignAdminRole(user.role)) {
      this.assertCollationUser(user);

      // Approvers may view logs for results they can act on (or already acted on).
      // Submitters may view logs for their own scope results.
      const ownLevel = getCollationLevelForRole(user.role as CampaignRole)!;
      const canViewOwn =
        result.level === ownLevel &&
        result.scopeType === user.scopeType &&
        result.scopeId === user.scopeId;

      if (!canViewOwn) {
        await this.verifyApproverScope(user, result);
      }
    }

    return this.prisma.collationActionLog.findMany({
      where: { collationResultId: resultId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  private async getWardPuReadinessMap(campaignId: string, wardIds: string[]) {
    const map = new Map<
      string,
      {
        totalPus: number;
        approvedPus: number;
        submittedPus: number;
        rejectedPus: number;
        missingPus: number;
        readyForLgaApproval: boolean;
      }
    >();

    if (wardIds.length === 0) return map;

    const pus = await this.prisma.pollingUnit.findMany({
      where: { wardId: { in: wardIds } },
      select: { id: true, wardId: true },
    });

    const puIds = pus.map((pu) => pu.id);
    const results = puIds.length
      ? await this.prisma.collationResult.findMany({
          where: {
            campaignId,
            level: CollationLevel.POLLING_UNIT,
            scopeId: { in: puIds },
          },
          select: { scopeId: true, status: true },
        })
      : [];

    const resultByPu = new Map(results.map((r) => [r.scopeId, r.status]));
    const pusByWard = new Map<string, string[]>();
    for (const pu of pus) {
      const list = pusByWard.get(pu.wardId) ?? [];
      list.push(pu.id);
      pusByWard.set(pu.wardId, list);
    }

    for (const wardId of wardIds) {
      const wardPuIds = pusByWard.get(wardId) ?? [];
      let approvedPus = 0;
      let submittedPus = 0;
      let rejectedPus = 0;
      let missingPus = 0;

      for (const puId of wardPuIds) {
        const status = resultByPu.get(puId);
        if (!status) {
          missingPus += 1;
          continue;
        }
        if (status === CollationResultStatus.APPROVED) approvedPus += 1;
        else if (status === CollationResultStatus.SUBMITTED) submittedPus += 1;
        else if (status === CollationResultStatus.REJECTED) rejectedPus += 1;
        else missingPus += 1; // DRAFT counts as not ready
      }

      const totalPus = wardPuIds.length;
      map.set(wardId, {
        totalPus,
        approvedPus,
        submittedPus,
        rejectedPus,
        missingPus,
        readyForLgaApproval: totalPus > 0 && approvedPus === totalPus,
      });
    }

    return map;
  }

  private async assertAllPollingUnitsApprovedInWard(campaignId: string, wardId: string) {
    const readiness = (await this.getWardPuReadinessMap(campaignId, [wardId])).get(wardId);
    if (!readiness) {
      throw new BadRequestException('Ward polling units could not be verified');
    }
    if (!readiness.readyForLgaApproval) {
      throw new BadRequestException(
        `Cannot approve this ward until every polling unit is approved. ` +
          `${readiness.approvedPus} of ${readiness.totalPus} PUs approved` +
          (readiness.submittedPus ? `, ${readiness.submittedPus} awaiting ward approval` : '') +
          (readiness.rejectedPus ? `, ${readiness.rejectedPus} returned` : '') +
          (readiness.missingPus ? `, ${readiness.missingPus} not yet submitted` : '') +
          '.',
      );
    }
  }

  private async writeActionLog(input: {
    campaignId: string;
    collationResultId: string;
    action: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    actorId: string;
    fromStatus?: CollationResultStatus | null;
    toStatus: CollationResultStatus;
    comment?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.collationActionLog.create({
      data: {
        campaignId: input.campaignId,
        collationResultId: input.collationResultId,
        action: input.action,
        actorId: input.actorId,
        fromStatus: input.fromStatus ?? null,
        toStatus: input.toStatus,
        comment: input.comment ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  private assertCollationUser(user: JwtPayload) {
    if (!user.campaignId || !user.role || !user.scopeType || !user.scopeId) {
      throw new ForbiddenException('Collation access requires scoped campaign membership');
    }
    if (!getCollationLevelForRole(user.role as CampaignRole)) {
      throw new ForbiddenException('Your role is not assigned to a collation level');
    }
  }

  private async getOwnedResult(user: JwtPayload, id: string) {
    const result = await this.prisma.collationResult.findUnique({ where: { id } });
    if (!result) throw new NotFoundException('Collation result not found');

    const level = getCollationLevelForRole(user.role as CampaignRole);
    if (
      result.campaignId !== user.campaignId ||
      result.level !== level ||
      result.scopeType !== user.scopeType ||
      result.scopeId !== user.scopeId
    ) {
      throw new ForbiddenException('You can only manage results for your assigned scope');
    }

    return result;
  }

  private async verifyApproverScope(
    user: JwtPayload,
    result: { level: string; scopeType: ScopeType | string; scopeId: string },
  ) {
    const userLevel = getCollationLevelForRole(user.role as CampaignRole)!;
    const subordinateLevel = getParentLevel(userLevel);
    if (!subordinateLevel || result.level !== subordinateLevel) {
      throw new ForbiddenException('You cannot approve results at this level');
    }

    const childScopeIds = await this.getChildScopeIds(
      user.scopeType as ScopeType,
      user.scopeId!,
      subordinateLevel,
    );

    if (!childScopeIds.includes(result.scopeId)) {
      throw new ForbiddenException('Result is outside your approval scope');
    }
  }

  private async countPendingApprovals(
    campaignId: string,
    level: CollationLevel,
    scopeType: ScopeType,
    scopeId?: string,
  ) {
    const subordinateLevel = getParentLevel(level);
    if (!subordinateLevel || !scopeId) return 0;

    const childScopeIds = await this.getChildScopeIds(scopeType, scopeId, subordinateLevel);
    return this.prisma.collationResult.count({
      where: {
        campaignId,
        level: subordinateLevel,
        status: CollationResultStatus.SUBMITTED,
        scopeId: { in: childScopeIds },
      },
    });
  }

  private async getChildScopeIds(
    scopeType: ScopeType,
    scopeId: string,
    childLevel: CollationLevel,
  ): Promise<string[]> {
    switch (childLevel) {
      case CollationLevel.POLLING_UNIT: {
        if (scopeType !== ScopeType.WARD) return [];
        const pus = await this.prisma.pollingUnit.findMany({ where: { wardId: scopeId }, select: { id: true } });
        return pus.map((p) => p.id);
      }
      case CollationLevel.WARD: {
        if (scopeType !== ScopeType.LGA) return [];
        const wards = await this.prisma.ward.findMany({ where: { lgaId: scopeId }, select: { id: true } });
        return wards.map((w) => w.id);
      }
      case CollationLevel.LGA: {
        if (scopeType !== ScopeType.STATE) return [];
        const lgas = await this.prisma.lGA.findMany({ where: { stateId: scopeId }, select: { id: true } });
        return lgas.map((l) => l.id);
      }
      case CollationLevel.STATE: {
        if (scopeType !== ScopeType.NATIONAL) return [];
        const states = await this.prisma.state.findMany({ select: { id: true } });
        return states.map((s) => s.id);
      }
      default:
        return [];
    }
  }

  private aggregatePartyResults(
    children: Array<{ partyResults: unknown }>,
  ): Record<string, number> {
    const totals: Record<string, number> = {};
    for (const child of children) {
      const partyResults = child.partyResults as Record<string, number> | null;
      if (!partyResults) continue;
      for (const [party, votes] of Object.entries(partyResults)) {
        totals[party] = (totals[party] ?? 0) + (votes ?? 0);
      }
    }
    return totals;
  }

  private async rollupToParent(
    campaignId: string,
    level: CollationLevel,
    scopeType: ScopeType,
    scopeId: string,
    submittedById?: string,
  ) {
    const subordinateLevel = getParentLevel(level);
    if (!subordinateLevel) return;

    const childScopeIds = await this.getChildScopeIds(scopeType, scopeId, subordinateLevel);
    const approvedChildren = await this.prisma.collationResult.findMany({
      where: {
        campaignId,
        level: subordinateLevel,
        scopeId: { in: childScopeIds },
        status: CollationResultStatus.APPROVED,
      },
    });

    if (approvedChildren.length === 0) return;

    const totals = approvedChildren.reduce(
      (acc, r) => ({
        registeredVoters: (acc.registeredVoters ?? 0) + (r.registeredVoters ?? 0),
        accreditedVoters: (acc.accreditedVoters ?? 0) + (r.accreditedVoters ?? 0),
        votesCast: (acc.votesCast ?? 0) + (r.votesCast ?? 0),
        invalidVotes: (acc.invalidVotes ?? 0) + (r.invalidVotes ?? 0),
      }),
      { registeredVoters: 0, accreditedVoters: 0, votesCast: 0, invalidVotes: 0 },
    );

    const partyResults = this.aggregatePartyResults(approvedChildren);
    // Ward rollups auto-submit to LGA for review.
    // LGA rollups are final once the LGA officer has approved wards — no state/director step.
    const isWardRollup = level === CollationLevel.WARD;
    const isLgaRollup = level === CollationLevel.LGA;
    const status = isWardRollup
      ? CollationResultStatus.SUBMITTED
      : isLgaRollup
        ? CollationResultStatus.APPROVED
        : CollationResultStatus.DRAFT;
    const now = new Date();

    const parent = await this.prisma.collationResult.upsert({
      where: {
        campaignId_level_scopeType_scopeId: {
          campaignId,
          level,
          scopeType,
          scopeId,
        },
      },
      create: {
        campaignId,
        level,
        scopeType,
        scopeId,
        ...totals,
        partyResults,
        status,
        submittedById: isWardRollup || isLgaRollup ? submittedById : undefined,
        submittedAt: isWardRollup || isLgaRollup ? now : undefined,
        approvedById: isLgaRollup ? submittedById : undefined,
        approvedAt: isLgaRollup ? now : undefined,
      },
      update: {
        ...totals,
        partyResults,
        status,
        submittedById: isWardRollup || isLgaRollup ? submittedById : undefined,
        submittedAt: isWardRollup || isLgaRollup ? now : undefined,
        approvedById: isLgaRollup ? submittedById : undefined,
        approvedAt: isLgaRollup ? now : undefined,
        rejectionReason: null,
        approvalComment: isLgaRollup ? null : undefined,
      },
    });

    if (isWardRollup && submittedById) {
      this.emitNotification({
        type: NotificationType.WARD_FORWARDED_TO_LGA,
        campaignId,
        actorUserId: submittedById,
        entityType: 'COLLATION_RESULT',
        entityId: parent.id,
        sourceEventId: `${parent.id}:FORWARDED`,
        sendPush: false,
        collationResult: {
          level: parent.level,
          scopeType: parent.scopeType,
          scopeId: parent.scopeId,
          submittedById: parent.submittedById,
        },
      });
    }
  }

  private emitNotification(payload: NotificationDispatchPayload) {
    this.eventEmitter.emit(NOTIFICATION_DISPATCH_EVENT, payload);
  }
}
