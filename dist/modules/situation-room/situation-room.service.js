"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SituationRoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SituationRoomService = class SituationRoomService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        pollingUnit: { select: { id: true, code: true, name: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
    };
    async assertCampaignAccess(userId, campaignId) {
        const membership = await this.prisma.campaignMembership.findFirst({
            where: { userId, campaignId, isActive: true },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this campaign');
        }
        return membership;
    }
    async getCampaignStateId(campaignId) {
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: campaignId },
            select: { stateId: true },
        });
        return campaign.stateId;
    }
    async assertPollingUnitInCampaign(campaignId, pollingUnitId) {
        const stateId = await this.getCampaignStateId(campaignId);
        const unit = await this.prisma.pollingUnit.findFirst({
            where: { id: pollingUnitId, ward: { lga: { stateId } } },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Polling unit not found in campaign state');
        }
        return unit;
    }
    campaignPuFilter(campaignId) {
        return {
            pollingUnit: {
                ward: { lga: { state: { campaigns: { some: { id: campaignId } } } } },
            },
        };
    }
    async list(user, query) {
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const where = {
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
    async getSummary(user, campaignId) {
        await this.assertCampaignAccess(user.sub, campaignId);
        const stateId = await this.getCampaignStateId(campaignId);
        const baseFilter = this.campaignPuFilter(campaignId);
        const [totalUpdates, open, reporting, closed, incidents, urgent, totalPollingUnits, unitsWithUpdates,] = await Promise.all([
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
    async findOne(user, id, campaignId) {
        await this.assertCampaignAccess(user.sub, campaignId);
        const update = await this.prisma.situationUpdate.findFirst({
            where: { id, ...this.campaignPuFilter(campaignId) },
            include: this.include,
        });
        if (!update) {
            throw new common_1.NotFoundException('Situation update not found');
        }
        return update;
    }
    async create(user, dto) {
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
    async update(user, id, dto) {
        if (!dto.campaignId) {
            throw new common_1.ForbiddenException('campaignId is required');
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
    async remove(user, id, campaignId) {
        await this.findOne(user, id, campaignId);
        await this.prisma.situationUpdate.delete({ where: { id } });
        return { success: true, message: 'Situation update deleted' };
    }
};
exports.SituationRoomService = SituationRoomService;
exports.SituationRoomService = SituationRoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SituationRoomService);
//# sourceMappingURL=situation-room.service.js.map