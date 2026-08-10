import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@electromon/db';
import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateSituationUpdateDto,
  ListSituationUpdatesQueryDto,
  UpdateSituationUpdateDto,
} from './dto/situation-update.dto';

@Injectable()
export class SituationRoomService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    pollingUnit: { select: { id: true, code: true, name: true } },
    reporter: { select: { id: true, firstName: true, lastName: true } },
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

  private async getCampaignStateId(campaignId: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      select: { stateId: true },
    });
    return campaign.stateId;
  }

  private async assertPollingUnitInCampaign(campaignId: string, pollingUnitId: string) {
    const stateId = await this.getCampaignStateId(campaignId);
    const unit = await this.prisma.pollingUnit.findFirst({
      where: { id: pollingUnitId, ward: { lga: { stateId } } },
    });
    if (!unit) {
      throw new NotFoundException('Polling unit not found in campaign state');
    }
    return unit;
  }

  private campaignPuFilter(campaignId: string): Prisma.SituationUpdateWhereInput {
    return {
      pollingUnit: {
        ward: { lga: { state: { campaigns: { some: { id: campaignId } } } } },
      },
    };
  }

  async list(user: JwtPayload, query: ListSituationUpdatesQueryDto) {
    await this.assertCampaignAccess(user.sub, query.campaignId);

    const where: Prisma.SituationUpdateWhereInput = {
      ...this.campaignPuFilter(query.campaignId),
      ...(query.status && { status: query.status }),
      ...(query.pollingUnitId && { pollingUnitId: query.pollingUnitId }),
      ...(query.reportedById && { reportedById: query.reportedById }),
      ...(query.isUrgent !== undefined && { isUrgent: query.isUrgent }),
    };

    return this.prisma.situationUpdate.findMany({
      where,
      include: this.include,
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  async getSummary(user: JwtPayload, campaignId: string) {
    await this.assertCampaignAccess(user.sub, campaignId);
    const stateId = await this.getCampaignStateId(campaignId);
    const baseFilter = this.campaignPuFilter(campaignId);

    const [
      totalUpdates,
      open,
      reporting,
      closed,
      incidents,
      urgent,
      totalPollingUnits,
      unitsWithUpdates,
    ] = await Promise.all([
      this.prisma.situationUpdate.count({ where: baseFilter }),
      this.prisma.situationUpdate.count({ where: { ...baseFilter, status: 'OPEN' } }),
      this.prisma.situationUpdate.count({ where: { ...baseFilter, status: 'REPORTING' } }),
      this.prisma.situationUpdate.count({ where: { ...baseFilter, status: 'CLOSED' } }),
      this.prisma.situationUpdate.count({ where: { ...baseFilter, status: 'INCIDENT' } }),
      this.prisma.situationUpdate.count({ where: { ...baseFilter, isUrgent: true } }),
      this.prisma.pollingUnit.count({ where: { ward: { lga: { stateId } } } }),
      this.prisma.situationUpdate.groupBy({
        by: ['pollingUnitId'],
        where: baseFilter,
      }).then((rows) => rows.length),
    ]);

    return {
      campaignId,
      totalUpdates,
      open,
      reporting,
      closed,
      incidents,
      urgent,
      totalPollingUnits,
      unitsWithUpdates,
    };
  }

  async findOne(user: JwtPayload, id: string, campaignId: string) {
    await this.assertCampaignAccess(user.sub, campaignId);

    const update = await this.prisma.situationUpdate.findFirst({
      where: { id, ...this.campaignPuFilter(campaignId) },
      include: this.include,
    });
    if (!update) {
      throw new NotFoundException('Situation update not found');
    }
    return update;
  }

  async create(user: JwtPayload, dto: CreateSituationUpdateDto) {
    await this.assertCampaignAccess(user.sub, dto.campaignId);
    await this.assertPollingUnitInCampaign(dto.campaignId, dto.pollingUnitId);

    return this.prisma.situationUpdate.create({
      data: {
        pollingUnitId: dto.pollingUnitId,
        reportedById: user.sub,
        status: dto.status,
        notes: dto.notes,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isUrgent: dto.isUrgent ?? false,
      },
      include: this.include,
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateSituationUpdateDto) {
    if (!dto.campaignId) {
      throw new ForbiddenException('campaignId is required');
    }

    await this.findOne(user, id, dto.campaignId);

    if (dto.pollingUnitId) {
      await this.assertPollingUnitInCampaign(dto.campaignId, dto.pollingUnitId);
    }

    const { campaignId: _campaignId, ...data } = dto;

    return this.prisma.situationUpdate.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  async remove(user: JwtPayload, id: string, campaignId: string) {
    await this.findOne(user, id, campaignId);
    await this.prisma.situationUpdate.delete({ where: { id } });
    return { success: true, message: 'Situation update deleted' };
  }
}
