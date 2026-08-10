import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CampaignRole,
  CollationLevel,
  CollationResultStatus,
  JwtPayload,
  ScopeType,
  getParentLevel,
  getCollationLevelForRole,
} from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import { CreateCollationResultDto, RejectCollationResultDto, ApproveCollationResultDto } from './dto/collation.dto';

const EDITABLE_STATUSES = new Set<CollationResultStatus>([
  CollationResultStatus.DRAFT,
  CollationResultStatus.REJECTED,
]);

@Injectable()
export class CollationService {
  constructor(
    private prisma: PrismaService,
    private scopeResolver: ScopeResolverService,
  ) {}

  async getDashboard(user: JwtPayload) {
    if (!user.role || !user.campaignId) {
      throw new ForbiddenException('No active campaign membership');
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

  async listWardPuSubmissions(user: JwtPayload) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.WARD || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for ward-scoped officers');
    }

    const puIds = await this.getChildScopeIds(
      ScopeType.WARD,
      user.scopeId,
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

  async listLgaWardSubmissions(user: JwtPayload) {
    this.assertCollationUser(user);
    if (user.scopeType !== ScopeType.LGA || !user.scopeId) {
      throw new ForbiddenException('This endpoint is for LGA-scoped collation officers');
    }

    const wardIds = await this.getChildScopeIds(
      ScopeType.LGA,
      user.scopeId,
      CollationLevel.WARD,
    );

    return this.enrichWardResults(
      await this.prisma.collationResult.findMany({
        where: {
          campaignId: user.campaignId,
          level: CollationLevel.WARD,
          scopeId: { in: wardIds },
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

    const approvedAt = new Date();
    await this.prisma.collationResult.updateMany({
      where: { id: { in: pending.map((r) => r.id) } },
      data: {
        status: CollationResultStatus.APPROVED,
        approvedById: user.sub,
        approvedAt,
        approvalComment: dto.comment ?? null,
      },
    });

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
        partyResults: dto.partyResults,
        ec8aPhotoUrls,
        status: CollationResultStatus.DRAFT,
      },
      update: {
        registeredVoters: dto.registeredVoters,
        accreditedVoters: dto.accreditedVoters,
        votesCast: dto.votesCast,
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

    return this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.SUBMITTED,
        submittedById: user.sub,
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });
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

    const approved = await this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.APPROVED,
        approvedById: user.sub,
        approvedAt: new Date(),
        approvalComment: dto.comment ?? null,
      },
    });

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

    if (result.status !== CollationResultStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted results can be rejected');
    }

    await this.verifyApproverScope(user, result);

    return this.prisma.collationResult.update({
      where: { id },
      data: {
        status: CollationResultStatus.REJECTED,
        rejectionReason: dto.reason,
        approvedById: user.sub,
        approvedAt: new Date(),
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
      }),
      { registeredVoters: 0, accreditedVoters: 0, votesCast: 0 },
    );

    const partyResults = this.aggregatePartyResults(approvedChildren);
    const autoSubmitUpstream =
      level === CollationLevel.WARD || level === CollationLevel.LGA;
    const status = autoSubmitUpstream
      ? CollationResultStatus.SUBMITTED
      : CollationResultStatus.DRAFT;

    await this.prisma.collationResult.upsert({
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
        submittedById: autoSubmitUpstream ? submittedById : undefined,
        submittedAt: autoSubmitUpstream ? new Date() : undefined,
      },
      update: {
        ...totals,
        partyResults,
        status,
        submittedById: autoSubmitUpstream ? submittedById : undefined,
        submittedAt: autoSubmitUpstream ? new Date() : undefined,
        rejectionReason: null,
      },
    });
  }
}
