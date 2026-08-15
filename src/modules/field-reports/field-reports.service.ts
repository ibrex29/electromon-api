import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@electromon/db';
import { FieldReportStatus, FieldReportType, IncidentType, IncidentSeverity, isIncidentSeverityUrgent, JwtPayload, NotificationType } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  getLgaScopeId,
  getWardScopeId,
  isLgaScopedUser,
  isWardScopedUser,
  assertPollingUnitInWard,
} from '../../common/scoping/campaign-scope';
import {
  CreateFieldReportDto,
  ListFieldReportsQueryDto,
  UpdateFieldReportStatusDto,
} from './dto/field-report.dto';
import {
  NOTIFICATION_DISPATCH_EVENT,
  NotificationDispatchPayload,
} from '../notifications/notification.events';

@Injectable()
export class FieldReportsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private readonly include = {
    reporter: { select: { id: true, firstName: true, lastName: true } },
    handledBy: { select: { id: true, firstName: true, lastName: true } },
    ward: { select: { id: true, name: true, lgaId: true } },
    pollingUnit: {
      select: {
        id: true,
        code: true,
        name: true,
        ward: { select: { id: true, name: true, lgaId: true } },
      },
    },
  } as const;

  private async assertCampaignAccess(userId: string, campaignId: string) {
    const membership = await this.prisma.campaignMembership.findFirst({
      where: { userId, campaignId, isActive: true },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this campaign');
    }
    return membership;
  }

  async list(user: JwtPayload, query: ListFieldReportsQueryDto) {
    await this.assertCampaignAccess(user.sub, query.campaignId);

    const wardScopeId = getWardScopeId(user);
    const lgaScopeId = getLgaScopeId(user);

    if (wardScopeId && query.wardId && query.wardId !== wardScopeId) {
      throw new ForbiddenException('You can only view incidents in your assigned ward');
    }

    if (lgaScopeId && query.lgaId && query.lgaId !== lgaScopeId) {
      throw new ForbiddenException('You can only view incidents in your assigned LGA');
    }

    const effectiveWardId = wardScopeId ?? query.wardId;
    const effectiveLgaId = wardScopeId ? undefined : lgaScopeId ?? query.lgaId;

    if (wardScopeId && query.pollingUnitId) {
      await assertPollingUnitInWard(this.prisma, query.pollingUnitId, wardScopeId);
    }

    const and: Prisma.FieldReportWhereInput[] = [];

    if (effectiveWardId) {
      and.push({
        OR: [{ wardId: effectiveWardId }, { pollingUnit: { wardId: effectiveWardId } }],
      });
    } else if (effectiveLgaId) {
      and.push({
        OR: [
          { ward: { lgaId: effectiveLgaId } },
          { pollingUnit: { ward: { lgaId: effectiveLgaId } } },
        ],
      });
    }

    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.FieldReportWhereInput = {
      campaignId: query.campaignId,
      ...(query.type && { type: query.type }),
      ...(query.incidentType && { incidentType: query.incidentType }),
      ...(query.incidentSeverity && { incidentSeverity: query.incidentSeverity }),
      ...(query.status && { status: query.status }),
      ...(query.isUrgent !== undefined && { isUrgent: query.isUrgent }),
      ...(query.pollingUnitId && { pollingUnitId: query.pollingUnitId }),
      ...(query.reportedById && { reportedById: query.reportedById }),
      ...(and.length ? { AND: and } : {}),
    };

    return this.prisma.fieldReport.findMany({
      where,
      include: this.include,
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
  }

  async create(user: JwtPayload, dto: CreateFieldReportDto) {
    await this.assertCampaignAccess(user.sub, dto.campaignId);

    const isIncident =
      dto.type === FieldReportType.INCIDENT || dto.type === FieldReportType.SECURITY_CONCERN;
    if (isIncident && !dto.incidentType) {
      throw new BadRequestException('incidentType is required for incident reports');
    }
    if (isIncident && !dto.incidentSeverity) {
      throw new BadRequestException('incidentSeverity is required for incident reports');
    }

    const isUrgent =
      dto.isUrgent ??
      (dto.incidentSeverity ? isIncidentSeverityUrgent(dto.incidentSeverity) : false);

    const wardScopeId = isWardScopedUser(user) ? getWardScopeId(user) : null;
    let wardId = dto.wardId;

    if (wardScopeId) {
      if (dto.wardId && dto.wardId !== wardScopeId) {
        throw new ForbiddenException('You can only report incidents for your assigned ward');
      }
      wardId = wardScopeId;
    }

    if (dto.pollingUnitId) {
      const stateId = (
        await this.prisma.campaign.findUniqueOrThrow({
          where: { id: dto.campaignId },
          select: { stateId: true },
        })
      ).stateId;
      const unit = await this.prisma.pollingUnit.findFirst({
        where: { id: dto.pollingUnitId, ward: { lga: { stateId } } },
      });
      if (!unit) throw new NotFoundException('Polling unit not found in campaign state');
      if (wardScopeId) {
        await assertPollingUnitInWard(this.prisma, dto.pollingUnitId, wardScopeId);
      }
      wardId = wardId ?? unit.wardId;
    }

    if (wardScopeId && !wardId) {
      wardId = wardScopeId;
    }

    // Ward officers escalate to LGA on create; PU agents leave as OPEN for ward triage.
    const initialStatus =
      wardScopeId && isIncident ? FieldReportStatus.ESCALATED : FieldReportStatus.OPEN;

    const created = await this.prisma.fieldReport.create({
      data: {
        campaignId: dto.campaignId,
        reportedById: user.sub,
        type: dto.type,
        incidentType: dto.incidentType,
        incidentSeverity: dto.incidentSeverity,
        title: dto.title,
        description: dto.description,
        wardId,
        pollingUnitId: dto.pollingUnitId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isUrgent,
        photoUrls: dto.photoUrls ?? [],
        status: initialStatus,
        ...(initialStatus === FieldReportStatus.ESCALATED
          ? { handledById: user.sub, handledAt: new Date() }
          : {}),
      },
      include: this.include,
    });

    if (isIncident) {
      this.emitNotification({
        type:
          initialStatus === FieldReportStatus.ESCALATED
            ? NotificationType.INCIDENT_ESCALATED
            : NotificationType.INCIDENT_REPORTED,
        campaignId: created.campaignId,
        actorUserId: user.sub,
        entityType: 'FIELD_REPORT',
        entityId: created.id,
        sourceEventId: `${created.id}:${initialStatus}`,
        sendPush: initialStatus === FieldReportStatus.OPEN,
        fieldReport: {
          wardId: created.wardId,
          pollingUnitId: created.pollingUnitId,
          reportedById: created.reportedById,
          isUrgent: created.isUrgent,
          incidentSeverity: created.incidentSeverity,
          status: created.status,
        },
      });
    }

    return created;
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateFieldReportStatusDto) {
    const report = await this.prisma.fieldReport.findUnique({
      where: { id },
      include: {
        ward: { select: { id: true, lgaId: true } },
        pollingUnit: { select: { wardId: true, ward: { select: { lgaId: true } } } },
      },
    });
    if (!report) throw new NotFoundException('Field report not found');

    await this.assertCampaignAccess(user.sub, report.campaignId);

    const reportWardId = report.wardId ?? report.pollingUnit?.wardId ?? report.ward?.id;
    const reportLgaId =
      report.ward?.lgaId ?? report.pollingUnit?.ward?.lgaId ?? undefined;

    if (isWardScopedUser(user)) {
      const wardScopeId = getWardScopeId(user)!;
      if (reportWardId !== wardScopeId) {
        throw new ForbiddenException('You can only manage incidents in your assigned ward');
      }
    } else if (isLgaScopedUser(user)) {
      const lgaScopeId = getLgaScopeId(user)!;
      if (reportLgaId && reportLgaId !== lgaScopeId) {
        throw new ForbiddenException('You can only manage incidents in your assigned LGA');
      }
      if (!reportLgaId && reportWardId) {
        const ward = await this.prisma.ward.findUnique({
          where: { id: reportWardId },
          select: { lgaId: true },
        });
        if (ward?.lgaId !== lgaScopeId) {
          throw new ForbiddenException('You can only manage incidents in your assigned LGA');
        }
      }
    }

    if (
      dto.status !== FieldReportStatus.ESCALATED &&
      dto.status !== FieldReportStatus.RESOLVED &&
      dto.status !== FieldReportStatus.OPEN
    ) {
      throw new ForbiddenException('Invalid status transition');
    }

    const updated = await this.prisma.fieldReport.update({
      where: { id },
      data: {
        status: dto.status,
        wardComment: dto.wardComment ?? report.wardComment,
        handledById: user.sub,
        handledAt: new Date(),
      },
      include: this.include,
    });

    if (dto.status === FieldReportStatus.RESOLVED) {
      this.emitNotification({
        type: NotificationType.INCIDENT_RESOLVED,
        campaignId: updated.campaignId,
        actorUserId: user.sub,
        entityType: 'FIELD_REPORT',
        entityId: updated.id,
        sourceEventId: `${updated.id}:RESOLVED`,
        sendPush: true,
        fieldReport: {
          wardId: updated.wardId,
          pollingUnitId: updated.pollingUnitId,
          reportedById: updated.reportedById,
          isUrgent: updated.isUrgent,
          incidentSeverity: updated.incidentSeverity,
          status: updated.status,
        },
      });
    } else if (dto.status === FieldReportStatus.ESCALATED) {
      this.emitNotification({
        type: NotificationType.INCIDENT_ESCALATED,
        campaignId: updated.campaignId,
        actorUserId: user.sub,
        entityType: 'FIELD_REPORT',
        entityId: updated.id,
        sourceEventId: `${updated.id}:ESCALATED`,
        sendPush: false,
        fieldReport: {
          wardId: updated.wardId,
          pollingUnitId: updated.pollingUnitId,
          reportedById: updated.reportedById,
          isUrgent: updated.isUrgent,
          incidentSeverity: updated.incidentSeverity,
          status: updated.status,
        },
      });
    }

    return updated;
  }

  private emitNotification(payload: NotificationDispatchPayload) {
    this.eventEmitter.emit(NOTIFICATION_DISPATCH_EVENT, payload);
  }
}
