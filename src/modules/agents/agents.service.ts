import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@electromon/db';
import { CampaignRole, JwtPayload, ScopeType } from '@electromon/shared';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  assertPollingUnitInWard,
  getLgaScopeId,
  getWardScopeId,
  isLgaScopedUser,
} from '../../common/scoping/campaign-scope';
import { normalizePhoneNumber, phoneLookupCandidates } from '../auth/phone.util';
import {
  CreateAgentDto,
  ListAgentsQueryDto,
  MANAGEABLE_AGENT_ROLES,
  ManageableAgentRole,
  PU_AGENT_ROLE,
  UpdateAgentDto,
  WARD_AGENT_ROLE,
} from './dto/agents.dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  private assertViewer(user: JwtPayload) {
    const allowed = new Set([
      CampaignRole.CAMPAIGN_DIRECTOR,
      CampaignRole.STATE_COLLATION_OFFICER,
      CampaignRole.LGA_COLLATION_OFFICER,
      CampaignRole.WARD_RA_OFFICER,
    ]);
    if (!user.role || !allowed.has(user.role as CampaignRole)) {
      throw new ForbiddenException('You cannot view agents');
    }
  }

  /** @deprecated use assertViewer — create/update removed from API */
  private assertManager(user: JwtPayload) {
    this.assertViewer(user);
    if (user.role === CampaignRole.WARD_RA_OFFICER) {
      throw new ForbiddenException('Ward officers can only view PU agents');
    }
  }

  private async assertAgentVisibleToUser(
    user: JwtPayload,
    role: ManageableAgentRole,
    scopeId: string,
  ) {
    const wardScopeId = getWardScopeId(user);
    if (wardScopeId) {
      if (!this.isPuRole(role)) {
        throw new ForbiddenException('Ward officers can only view PU agents');
      }
      await assertPollingUnitInWard(this.prisma, scopeId, wardScopeId);
      return;
    }

    const managedLgaId = await this.requireManagedLgaId(user, undefined, role, scopeId);
    await this.resolveScopeInLga(role, scopeId, managedLgaId);
  }

  private async assertCampaignAccess(userId: string, campaignId: string) {
    const membership = await this.prisma.campaignMembership.findFirst({
      where: { userId, campaignId, isActive: true },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this campaign');
    }
    return membership;
  }

  private resolveManagedLgaId(user: JwtPayload, requestedLgaId?: string): string | undefined {
    if (isLgaScopedUser(user)) {
      const scopeId = getLgaScopeId(user);
      if (!scopeId) throw new ForbiddenException('Your account is not assigned to an LGA');
      if (requestedLgaId && requestedLgaId !== scopeId) {
        throw new ForbiddenException('You can only manage agents in your assigned LGA');
      }
      return scopeId;
    }

    return requestedLgaId;
  }

  private async requireManagedLgaId(
    user: JwtPayload,
    requestedLgaId: string | undefined,
    role: ManageableAgentRole,
    scopeId: string,
  ): Promise<string> {
    const fromUser = this.resolveManagedLgaId(user, requestedLgaId);
    if (fromUser) return fromUser;

    if (this.isWardRole(role)) {
      const ward = await this.prisma.ward.findUnique({
        where: { id: scopeId },
        select: { lgaId: true },
      });
      if (!ward) throw new BadRequestException('Ward not found');
      return ward.lgaId;
    }

    const pu = await this.prisma.pollingUnit.findUnique({
      where: { id: scopeId },
      select: { ward: { select: { lgaId: true } } },
    });
    if (!pu) throw new BadRequestException('Polling unit not found');
    return pu.ward.lgaId;
  }

  private isWardRole(role: CampaignRole): boolean {
    return role === WARD_AGENT_ROLE;
  }

  private isPuRole(role: CampaignRole): boolean {
    return role === PU_AGENT_ROLE;
  }

  private assertManageableRole(role: CampaignRole): asserts role is ManageableAgentRole {
    if (!(MANAGEABLE_AGENT_ROLES as readonly CampaignRole[]).includes(role)) {
      throw new BadRequestException('Role cannot be assigned via agent management');
    }
  }

  private async resolveScopeInLga(role: ManageableAgentRole, scopeId: string, lgaId: string) {
    if (this.isWardRole(role)) {
      const ward = await this.prisma.ward.findFirst({
        where: { id: scopeId, lgaId },
        include: { lga: { select: { id: true, name: true } } },
      });
      if (!ward) {
        throw new BadRequestException('Ward not found in this LGA');
      }
      return {
        scopeType: ScopeType.WARD as const,
        scopeId: ward.id,
        scopeName: ward.name,
        wardName: ward.name,
        lgaName: ward.lga.name,
      };
    }

    const pu = await this.prisma.pollingUnit.findFirst({
      where: { id: scopeId, ward: { lgaId } },
      include: {
        ward: { include: { lga: { select: { id: true, name: true } } } },
      },
    });
    if (!pu) {
      throw new BadRequestException('Polling unit not found in this LGA');
    }
    return {
      scopeType: ScopeType.POLLING_UNIT as const,
      scopeId: pu.id,
      scopeName: `${pu.name} (${pu.code})`,
      wardName: pu.ward.name,
      lgaName: pu.ward.lga.name,
    };
  }

  private mapAgent(
    m: {
      id: string;
      role: string;
      scopeType: string | null;
      scopeId: string | null;
      isActive: boolean;
      createdAt: Date;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        isActive: boolean;
      };
    },
    meta: { scopeName: string; wardName?: string | null; lgaName?: string | null },
  ) {
    return {
      membershipId: m.id,
      userId: m.user.id,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      phoneNumber: m.user.phoneNumber,
      email: m.user.email,
      role: m.role as CampaignRole,
      scopeType: m.scopeType as ScopeType,
      scopeId: m.scopeId as string,
      scopeName: meta.scopeName,
      wardName: meta.wardName ?? null,
      lgaName: meta.lgaName ?? null,
      isActive: m.isActive,
      userActive: m.user.isActive,
      createdAt: m.createdAt,
    };
  }

  private async enrichMemberships(
    memberships: Array<{
      id: string;
      role: string;
      scopeType: string | null;
      scopeId: string | null;
      isActive: boolean;
      createdAt: Date;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        isActive: boolean;
      };
    }>,
  ) {
    const wardIds = memberships
      .filter((m) => m.scopeType === ScopeType.WARD && m.scopeId)
      .map((m) => m.scopeId as string);
    const puIds = memberships
      .filter((m) => m.scopeType === ScopeType.POLLING_UNIT && m.scopeId)
      .map((m) => m.scopeId as string);

    const [wards, units] = await Promise.all([
      wardIds.length
        ? this.prisma.ward.findMany({
            where: { id: { in: wardIds } },
            include: { lga: { select: { name: true } } },
          })
        : Promise.resolve([]),
      puIds.length
        ? this.prisma.pollingUnit.findMany({
            where: { id: { in: puIds } },
            include: { ward: { include: { lga: { select: { name: true } } } } },
          })
        : Promise.resolve([]),
    ]);

    const wardMap = new Map(wards.map((w) => [w.id, w]));
    const puMap = new Map(units.map((u) => [u.id, u]));

    return memberships.map((m) => {
      if (m.scopeType === ScopeType.WARD && m.scopeId) {
        const ward = wardMap.get(m.scopeId);
        return this.mapAgent(m, {
          scopeName: ward?.name ?? m.scopeId,
          wardName: ward?.name,
          lgaName: ward?.lga.name,
        });
      }
      if (m.scopeType === ScopeType.POLLING_UNIT && m.scopeId) {
        const pu = puMap.get(m.scopeId);
        return this.mapAgent(m, {
          scopeName: pu ? `${pu.name} (${pu.code})` : m.scopeId,
          wardName: pu?.ward.name,
          lgaName: pu?.ward.lga.name,
        });
      }
      return this.mapAgent(m, { scopeName: m.scopeId ?? '—' });
    });
  }

  async listOptions(user: JwtPayload, campaignId: string, lgaId?: string) {
    this.assertViewer(user);
    await this.assertCampaignAccess(user.sub, campaignId);

    const wardScopeId = getWardScopeId(user);
    if (wardScopeId) {
      const ward = await this.prisma.ward.findUnique({
        where: { id: wardScopeId },
        include: {
          lga: { select: { id: true, name: true } },
          pollingUnits: {
            orderBy: { code: 'asc' },
            select: { id: true, code: true, name: true },
          },
        },
      });
      if (!ward) throw new NotFoundException('Ward not found');
      return {
        lga: ward.lga,
        ward: { id: ward.id, name: ward.name },
        wards: [
          {
            id: ward.id,
            name: ward.name,
            registrationAreaCode: ward.registrationAreaCode,
            pollingUnits: ward.pollingUnits,
          },
        ],
      };
    }

    const managedLgaId = this.resolveManagedLgaId(user, lgaId);
    if (!managedLgaId) {
      throw new BadRequestException('lgaId is required');
    }

    const lga = await this.prisma.lGA.findUnique({
      where: { id: managedLgaId },
      select: { id: true, name: true },
    });
    if (!lga) throw new NotFoundException('LGA not found');

    const wards = await this.prisma.ward.findMany({
      where: { lgaId: managedLgaId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        registrationAreaCode: true,
        pollingUnits: {
          orderBy: { code: 'asc' },
          select: { id: true, code: true, name: true },
        },
      },
    });

    return {
      lga,
      wards: wards.map((w) => ({
        id: w.id,
        name: w.name,
        registrationAreaCode: w.registrationAreaCode,
        pollingUnits: w.pollingUnits,
      })),
    };
  }

  async list(user: JwtPayload, query: ListAgentsQueryDto) {
    this.assertViewer(user);
    await this.assertCampaignAccess(user.sub, query.campaignId);

    const wardScopeId = getWardScopeId(user);
    if (wardScopeId) {
      if (query.wardId && query.wardId !== wardScopeId) {
        throw new ForbiddenException('You can only view agents in your assigned ward');
      }

      const puIds = (
        await this.prisma.pollingUnit.findMany({
          where: { wardId: wardScopeId },
          select: { id: true },
        })
      ).map((p) => p.id);

      if (!puIds.length) return [];

      const search = query.search?.trim();
      const memberships = await this.prisma.campaignMembership.findMany({
        where: {
          campaignId: query.campaignId,
          role: PU_AGENT_ROLE,
          scopeType: ScopeType.POLLING_UNIT,
          scopeId: { in: puIds },
          ...(query.includeInactive ? {} : { isActive: true }),
          ...(search
            ? {
                user: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { phoneNumber: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                },
              }
            : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 500,
      });

      return this.enrichMemberships(memberships);
    }

    const managedLgaId = this.resolveManagedLgaId(user, query.lgaId);
    if (!managedLgaId) {
      throw new BadRequestException('lgaId is required');
    }

    const kind = query.kind ?? 'all';
    const roleFilter =
      kind === 'ward'
        ? [WARD_AGENT_ROLE]
        : kind === 'pu'
          ? [PU_AGENT_ROLE]
          : [...MANAGEABLE_AGENT_ROLES];

    const wardIds = (
      await this.prisma.ward.findMany({
        where: { lgaId: managedLgaId, ...(query.wardId ? { id: query.wardId } : {}) },
        select: { id: true },
      })
    ).map((w) => w.id);

    const puIds = (
      await this.prisma.pollingUnit.findMany({
        where: {
          ward: {
            lgaId: managedLgaId,
            ...(query.wardId ? { id: query.wardId } : {}),
          },
        },
        select: { id: true },
      })
    ).map((p) => p.id);

    const scopeOr: Prisma.CampaignMembershipWhereInput[] = [];
    if (kind !== 'pu' && wardIds.length) {
      scopeOr.push({ scopeType: ScopeType.WARD, scopeId: { in: wardIds } });
    }
    if (kind !== 'ward' && puIds.length) {
      scopeOr.push({ scopeType: ScopeType.POLLING_UNIT, scopeId: { in: puIds } });
    }

    if (!scopeOr.length) {
      return [];
    }

    const search = query.search?.trim();
    const memberships = await this.prisma.campaignMembership.findMany({
      where: {
        campaignId: query.campaignId,
        role: { in: roleFilter },
        OR: scopeOr,
        ...(query.includeInactive ? {} : { isActive: true }),
        ...(search
          ? {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { phoneNumber: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
      take: 500,
    });

    return this.enrichMemberships(memberships);
  }

  async listActivities(user: JwtPayload, membershipId: string) {
    this.assertViewer(user);

    const membership = await this.prisma.campaignMembership.findUnique({
      where: { id: membershipId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            isActive: true,
          },
        },
      },
    });
    if (!membership) throw new NotFoundException('Agent not found');

    await this.assertCampaignAccess(user.sub, membership.campaignId);
    this.assertManageableRole(membership.role as CampaignRole);

    await this.assertAgentVisibleToUser(
      user,
      membership.role as ManageableAgentRole,
      membership.scopeId!,
    );

    const userId = membership.userId;
    const campaignId = membership.campaignId;

    const [collationLogs, reportedIncidents, handledIncidents] = await Promise.all([
      this.prisma.collationActionLog.findMany({
        where: { actorId: userId, campaignId },
        include: {
          collationResult: {
            select: {
              id: true,
              level: true,
              scopeType: true,
              scopeId: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 80,
      }),
      this.prisma.fieldReport.findMany({
        where: { reportedById: userId, campaignId },
        include: {
          pollingUnit: { select: { code: true, name: true } },
          ward: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 80,
      }),
      this.prisma.fieldReport.findMany({
        where: { handledById: userId, campaignId, NOT: { reportedById: userId } },
        include: {
          pollingUnit: { select: { code: true, name: true } },
          ward: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 80,
      }),
    ]);

    const scopeIds = [
      ...new Set(
        collationLogs
          .map((l) => l.collationResult?.scopeId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const [wards, units] = await Promise.all([
      this.prisma.ward.findMany({
        where: { id: { in: scopeIds } },
        select: { id: true, name: true },
      }),
      this.prisma.pollingUnit.findMany({
        where: { id: { in: scopeIds } },
        select: { id: true, code: true, name: true },
      }),
    ]);
    const wardName = new Map(wards.map((w) => [w.id, w.name]));
    const puName = new Map(units.map((u) => [u.id, `${u.name} (${u.code})`]));

    const collationActionLabel: Record<string, string> = {
      SUBMITTED: 'Submitted result',
      APPROVED: 'Approved result',
      REJECTED: 'Returned result',
    };

    type Activity = {
      id: string;
      kind: 'COLLATION' | 'INCIDENT_REPORTED' | 'INCIDENT_HANDLED';
      title: string;
      detail: string | null;
      status: string | null;
      createdAt: Date;
    };

    const activities: Activity[] = [];

    for (const log of collationLogs) {
      const result = log.collationResult;
      const scopeLabel =
        (result?.scopeId && (wardName.get(result.scopeId) || puName.get(result.scopeId))) ||
        result?.scopeId ||
        'Unknown scope';
      activities.push({
        id: `collation-${log.id}`,
        kind: 'COLLATION',
        title: collationActionLabel[log.action] ?? log.action,
        detail: `${result?.level ?? '—'} · ${scopeLabel}${log.comment ? ` · ${log.comment}` : ''}`,
        status: log.toStatus,
        createdAt: log.createdAt,
      });
    }

    for (const report of reportedIncidents) {
      const place =
        report.pollingUnit
          ? `${report.pollingUnit.code} — ${report.pollingUnit.name}`
          : report.ward?.name ?? 'Incident';
      activities.push({
        id: `incident-reported-${report.id}`,
        kind: 'INCIDENT_REPORTED',
        title: `Reported: ${report.title}`,
        detail: place,
        status: report.status,
        createdAt: report.createdAt,
      });
    }

    for (const report of handledIncidents) {
      const place =
        report.pollingUnit
          ? `${report.pollingUnit.code} — ${report.pollingUnit.name}`
          : report.ward?.name ?? 'Incident';
      activities.push({
        id: `incident-handled-${report.id}`,
        kind: 'INCIDENT_HANDLED',
        title: `${report.status === 'RESOLVED' ? 'Resolved' : 'Handled'}: ${report.title}`,
        detail: place + (report.wardComment ? ` · ${report.wardComment}` : ''),
        status: report.status,
        createdAt: report.handledAt ?? report.createdAt,
      });
    }

    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const [agent] = await this.enrichMemberships([membership]);

    return {
      agent,
      activities: activities.slice(0, 5).map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async create(user: JwtPayload, dto: CreateAgentDto) {
    this.assertManager(user);
    await this.assertCampaignAccess(user.sub, dto.campaignId);
    this.assertManageableRole(dto.role);

    const managedLgaId = await this.requireManagedLgaId(user, undefined, dto.role, dto.scopeId);
    const scope = await this.resolveScopeInLga(dto.role, dto.scopeId, managedLgaId);

    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    if (!phoneNumber) {
      throw new BadRequestException('Invalid phone number');
    }

    const email =
      dto.email?.trim().toLowerCase() ||
      `agent.${phoneNumber.replace(/\D/g, '')}@electromon.local`;

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const candidates = phoneLookupCandidates(dto.phoneNumber);
    let existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(candidates.length ? [{ phoneNumber: { in: candidates } }] : []),
        ],
      },
    });

    if (existing) {
      const otherPhone = await this.prisma.user.findFirst({
        where: {
          id: { not: existing.id },
          phoneNumber: { in: candidates },
        },
      });
      if (otherPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    if (!existing) {
      existing = await this.prisma.user.create({
        data: {
          email,
          phoneNumber,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          isActive: true,
        },
      });
    } else {
      existing = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phoneNumber,
          passwordHash,
          isActive: true,
          ...(dto.email ? { email } : {}),
        },
      });
    }

    const membership = await this.prisma.campaignMembership.upsert({
      where: {
        userId_campaignId: { userId: existing.id, campaignId: dto.campaignId },
      },
      create: {
        userId: existing.id,
        campaignId: dto.campaignId,
        role: dto.role,
        scopeType: scope.scopeType,
        scopeId: scope.scopeId,
        isActive: true,
      },
      update: {
        role: dto.role,
        scopeType: scope.scopeType,
        scopeId: scope.scopeId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return this.mapAgent(membership, {
      scopeName: scope.scopeName,
      wardName: scope.wardName,
      lgaName: scope.lgaName,
    });
  }

  async update(user: JwtPayload, membershipId: string, dto: UpdateAgentDto) {
    this.assertManager(user);

    const membership = await this.prisma.campaignMembership.findUnique({
      where: { id: membershipId },
      include: {
        user: true,
      },
    });
    if (!membership) throw new NotFoundException('Agent not found');

    await this.assertCampaignAccess(user.sub, membership.campaignId);
    this.assertManageableRole(membership.role as CampaignRole);

    const managedLgaId = await this.requireManagedLgaId(
      user,
      undefined,
      membership.role as ManageableAgentRole,
      membership.scopeId!,
    );
    // Ensure current assignment is in managed LGA
    await this.resolveScopeInLga(
      membership.role as ManageableAgentRole,
      membership.scopeId!,
      managedLgaId,
    );

    const nextRole = (dto.role ?? membership.role) as ManageableAgentRole;
    this.assertManageableRole(nextRole);
    const nextScopeId = dto.scopeId ?? membership.scopeId!;
    const scope = await this.resolveScopeInLga(nextRole, nextScopeId, managedLgaId);

    let phoneNumber = membership.user.phoneNumber;
    if (dto.phoneNumber) {
      phoneNumber = normalizePhoneNumber(dto.phoneNumber);
      if (!phoneNumber) throw new BadRequestException('Invalid phone number');
      const candidates = phoneLookupCandidates(dto.phoneNumber);
      const clash = await this.prisma.user.findFirst({
        where: {
          id: { not: membership.userId },
          phoneNumber: { in: candidates },
        },
      });
      if (clash) throw new ConflictException('Phone number already in use');
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;

    await this.prisma.user.update({
      where: { id: membership.userId },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName.trim() } : {}),
        ...(dto.lastName ? { lastName: dto.lastName.trim() } : {}),
        ...(dto.phoneNumber ? { phoneNumber } : {}),
        ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(dto.isActive === false ? { isActive: false } : {}),
        ...(dto.isActive === true ? { isActive: true } : {}),
      },
    });

    const updated = await this.prisma.campaignMembership.update({
      where: { id: membershipId },
      data: {
        role: nextRole,
        scopeType: scope.scopeType,
        scopeId: scope.scopeId,
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return this.mapAgent(updated, {
      scopeName: scope.scopeName,
      wardName: scope.wardName,
      lgaName: scope.lgaName,
    });
  }
}
