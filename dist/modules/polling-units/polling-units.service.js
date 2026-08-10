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
exports.PollingUnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PollingUnitsService = class PollingUnitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        ward: {
            include: {
                lga: { select: { id: true, name: true } },
            },
        },
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
            select: { stateId: true, state: { select: { code: true } } },
        });
        if (campaign.state.code !== 'JI') {
            throw new common_1.ForbiddenException('Only Jigawa polling units are supported in this MVP');
        }
        return campaign.stateId;
    }
    async assertWardInCampaignState(campaignId, wardId) {
        const stateId = await this.getCampaignStateId(campaignId);
        const ward = await this.prisma.ward.findFirst({
            where: { id: wardId, lga: { stateId } },
        });
        if (!ward) {
            throw new common_1.NotFoundException('Ward not found in campaign state');
        }
        return ward;
    }
    async assertAgentInCampaign(campaignId, volunteerId) {
        const volunteer = await this.prisma.volunteer.findFirst({
            where: { id: volunteerId, campaignId },
        });
        if (!volunteer) {
            throw new common_1.NotFoundException('Assigned agent not found in this campaign');
        }
    }
    async enrichWithAgents(units) {
        const agentIds = [...new Set(units.map((u) => u.assignedAgentId).filter(Boolean))];
        if (agentIds.length === 0) {
            return units.map((u) => ({ ...u, assignedAgent: null }));
        }
        const agents = await this.prisma.volunteer.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, firstName: true, lastName: true },
        });
        const agentMap = new Map(agents.map((a) => [a.id, a]));
        return units.map((unit) => ({
            ...unit,
            assignedAgent: unit.assignedAgentId ? agentMap.get(unit.assignedAgentId) ?? null : null,
        }));
    }
    async list(user, query) {
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const stateId = await this.getCampaignStateId(query.campaignId);
        const where = {
            ward: {
                lga: {
                    stateId,
                    ...(query.lgaId && { id: query.lgaId }),
                },
                ...(query.wardId && { id: query.wardId }),
            },
            ...(query.status && { status: query.status }),
            ...(query.strength && { strengthAssessment: query.strength }),
            ...(query.search && {
                OR: [
                    { code: { contains: query.search, mode: 'insensitive' } },
                    { name: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        const units = await this.prisma.pollingUnit.findMany({
            where,
            include: this.include,
            orderBy: [{ ward: { lga: { name: 'asc' } } }, { code: 'asc' }],
        });
        return this.enrichWithAgents(units);
    }
    async findOne(user, id, campaignId) {
        await this.assertCampaignAccess(user.sub, campaignId);
        const stateId = await this.getCampaignStateId(campaignId);
        const unit = await this.prisma.pollingUnit.findFirst({
            where: { id, ward: { lga: { stateId } } },
            include: this.include,
        });
        if (!unit) {
            throw new common_1.NotFoundException('Polling unit not found');
        }
        const [enriched] = await this.enrichWithAgents([unit]);
        return enriched;
    }
    async create(user, dto) {
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        await this.assertWardInCampaignState(dto.campaignId, dto.wardId);
        if (dto.assignedAgentId) {
            await this.assertAgentInCampaign(dto.campaignId, dto.assignedAgentId);
        }
        const existing = await this.prisma.pollingUnit.findUnique({ where: { code: dto.code } });
        if (existing) {
            throw new common_1.ConflictException('Polling unit code already exists');
        }
        const unit = await this.prisma.pollingUnit.create({
            data: {
                code: dto.code,
                name: dto.name,
                wardId: dto.wardId,
                latitude: dto.latitude,
                longitude: dto.longitude,
                strengthAssessment: dto.strengthAssessment,
                status: dto.status,
                assignedAgentId: dto.assignedAgentId,
                notes: dto.notes,
            },
            include: this.include,
        });
        const [enriched] = await this.enrichWithAgents([unit]);
        return enriched;
    }
    async update(user, id, dto) {
        if (!dto.campaignId) {
            throw new common_1.ForbiddenException('campaignId is required');
        }
        const existing = await this.findOne(user, id, dto.campaignId);
        if (dto.wardId && dto.wardId !== existing.wardId) {
            await this.assertWardInCampaignState(dto.campaignId, dto.wardId);
        }
        if (dto.assignedAgentId) {
            await this.assertAgentInCampaign(dto.campaignId, dto.assignedAgentId);
        }
        if (dto.code && dto.code !== existing.code) {
            const duplicate = await this.prisma.pollingUnit.findUnique({ where: { code: dto.code } });
            if (duplicate) {
                throw new common_1.ConflictException('Polling unit code already exists');
            }
        }
        const { campaignId: _campaignId, ...data } = dto;
        const unit = await this.prisma.pollingUnit.update({
            where: { id },
            data,
            include: this.include,
        });
        const [enriched] = await this.enrichWithAgents([unit]);
        return enriched;
    }
    async remove(user, id, campaignId) {
        await this.findOne(user, id, campaignId);
        await this.prisma.pollingUnit.delete({ where: { id } });
        return { success: true, message: 'Polling unit deleted' };
    }
};
exports.PollingUnitsService = PollingUnitsService;
exports.PollingUnitsService = PollingUnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PollingUnitsService);
//# sourceMappingURL=polling-units.service.js.map