import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@electromon/db';
import { FieldReportStatus, FieldReportType, IncidentType, IncidentSeverity, isIncidentSeverityUrgent, JwtPayload } from '@electromon/shared';
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

@Injectable()
export class FieldReportsService {
  constructor(private prisma: PrismaService) {}

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

    let wardId = dto.wardId;
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
      wardId = wardId ?? unit.wardId;
    }

    return this.prisma.fieldReport.create({
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
        status: FieldReportStatus.OPEN,
      },
      include: this.include,
    });
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

    return this.prisma.fieldReport.update({
      where: { id },
      data: {
        status: dto.status,
        wardComment: dto.wardComment ?? report.wardComment,
        handledById: user.sub,
        handledAt: new Date(),
      },
      include: this.include,
    });
  }
}
