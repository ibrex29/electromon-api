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
exports.CommitmentsService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@electromon/db");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CommitmentsService = class CommitmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        supportGroup: { select: { id: true, name: true } },
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
    async assertSupportGroupInCampaign(campaignId, supportGroupId) {
        const group = await this.prisma.supportGroup.findFirst({
            where: { id: supportGroupId, campaignId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Support group not found in this campaign');
        }
        return group;
    }
    async list(user, query) {
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const where = {
            campaignId: query.campaignId,
            ...(query.status && { status: query.status }),
            ...(query.supportGroupId && { supportGroupId: query.supportGroupId }),
            ...(query.search && {
                OR: [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        return this.prisma.commitment.findMany({
            where,
            include: this.include,
            orderBy: [{ deadline: 'asc' }, { updatedAt: 'desc' }],
        });
    }
    async findOne(user, id) {
        const commitment = await this.prisma.commitment.findUnique({
            where: { id },
            include: this.include,
        });
        if (!commitment) {
            throw new common_1.NotFoundException('Commitment not found');
        }
        await this.assertCampaignAccess(user.sub, commitment.campaignId);
        return commitment;
    }
    async create(user, dto) {
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        await this.assertSupportGroupInCampaign(dto.campaignId, dto.supportGroupId);
        const currentValue = dto.currentValue ?? 0;
        if (currentValue > dto.targetValue) {
            throw new common_1.BadRequestException('Current value cannot exceed target value');
        }
        return this.prisma.commitment.create({
            data: {
                campaignId: dto.campaignId,
                supportGroupId: dto.supportGroupId,
                title: dto.title,
                description: dto.description,
                targetValue: dto.targetValue,
                currentValue,
                deadline: new Date(dto.deadline),
                status: dto.status ?? db_1.CommitmentStatus.DRAFT,
            },
            include: this.include,
        });
    }
    async update(user, id, dto) {
        const existing = await this.findOne(user, id);
        if (dto.campaignId && dto.campaignId !== existing.campaignId) {
            throw new common_1.ForbiddenException('Cannot move commitment to another campaign');
        }
        const supportGroupId = dto.supportGroupId ?? existing.supportGroupId;
        if (dto.supportGroupId) {
            await this.assertSupportGroupInCampaign(existing.campaignId, supportGroupId);
        }
        const targetValue = dto.targetValue ?? existing.targetValue;
        const currentValue = dto.currentValue ?? existing.currentValue;
        if (currentValue > targetValue) {
            throw new common_1.BadRequestException('Current value cannot exceed target value');
        }
        const { campaignId: _campaignId, deadline, ...rest } = dto;
        return this.prisma.commitment.update({
            where: { id },
            data: {
                ...rest,
                ...(deadline && { deadline: new Date(deadline) }),
            },
            include: this.include,
        });
    }
    async remove(user, id) {
        await this.findOne(user, id);
        await this.prisma.commitment.delete({ where: { id } });
        return { success: true, message: 'Commitment deleted' };
    }
};
exports.CommitmentsService = CommitmentsService;
exports.CommitmentsService = CommitmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommitmentsService);
//# sourceMappingURL=commitments.service.js.map