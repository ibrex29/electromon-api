import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@electromon/db';
import { FieldReportStatus, JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  getWardScopeId,
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
    ward: { select: { id: true, name: true } },
    pollingUnit: { select: { id: true, code: true, name: true } },
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
    if (wardScopeId && query.wardId && query.wardId !== wardScopeId) {
      throw new ForbiddenException('You can only view incidents in your assigned ward');
    }

    const effectiveWardId = wardScopeId ?? query.wardId;

    if (wardScopeId && query.pollingUnitId) {
      await assertPollingUnitInWard(this.prisma, query.pollingUnitId, wardScopeId);
    }

    const where: Prisma.FieldReportWhereInput = {
      campaignId: query.campaignId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.isUrgent !== undefined && { isUrgent: query.isUrgent }),
      ...(query.pollingUnitId && { pollingUnitId: query.pollingUnitId }),
      ...(query.reportedById && { reportedById: query.reportedById }),
      ...(effectiveWardId && {
        OR: [{ wardId: effectiveWardId }, { pollingUnit: { wardId: effectiveWardId } }],
      }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.fieldReport.findMany({
      where,
      include: this.include,
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  async create(user: JwtPayload, dto: CreateFieldReportDto) {
    await this.assertCampaignAccess(user.sub, dto.campaignId);

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
        title: dto.title,
        description: dto.description,
        wardId,
        pollingUnitId: dto.pollingUnitId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isUrgent: dto.isUrgent ?? false,
        photoUrls: dto.photoUrls ?? [],
        status: FieldReportStatus.OPEN,
      },
      include: this.include,
    });
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateFieldReportStatusDto) {
    const report = await this.prisma.fieldReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Field report not found');

    await this.assertCampaignAccess(user.sub, report.campaignId);

    if (isWardScopedUser(user)) {
      const wardScopeId = getWardScopeId(user)!;
      const reportWardId =
        report.wardId ??
        (report.pollingUnitId
          ? (
              await this.prisma.pollingUnit.findUnique({
                where: { id: report.pollingUnitId },
                select: { wardId: true },
              })
            )?.wardId
          : undefined);
      if (reportWardId !== wardScopeId) {
        throw new ForbiddenException('You can only manage incidents in your assigned ward');
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
