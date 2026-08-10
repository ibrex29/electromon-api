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
exports.SupportGroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SupportGroupsService = class SupportGroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        lga: { select: { id: true, name: true } },
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
    async list(user, query) {
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const where = {
            campaignId: query.campaignId,
            ...(query.category && { category: query.category }),
            ...(query.verificationStatus && { verificationStatus: query.verificationStatus }),
            ...(query.lgaId && { lgaId: query.lgaId }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { leaderName: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        return this.prisma.supportGroup.findMany({
            where,
            include: this.include,
            orderBy: [{ updatedAt: 'desc' }],
        });
    }
    async findOne(user, id) {
        const group = await this.prisma.supportGroup.findUnique({
            where: { id },
            include: this.include,
        });
        if (!group) {
            throw new common_1.NotFoundException('Support group not found');
        }
        await this.assertCampaignAccess(user.sub, group.campaignId);
        return group;
    }
    async create(user, dto) {
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        if (dto.lgaId) {
            await this.assertLgaInJigawaCampaign(dto.campaignId, dto.lgaId);
        }
        return this.prisma.supportGroup.create({
            data: {
                campaignId: dto.campaignId,
                name: dto.name,
                category: dto.category,
                leaderName: dto.leaderName,
                leaderPhone: dto.leaderPhone,
                leaderEmail: dto.leaderEmail,
                memberCount: dto.memberCount ?? 0,
                lgaId: dto.lgaId,
                areaOfOperation: dto.areaOfOperation,
            },
            include: this.include,
        });
    }
    async update(user, id, dto) {
        const existing = await this.findOne(user, id);
        if (dto.campaignId && dto.campaignId !== existing.campaignId) {
            throw new common_1.ForbiddenException('Cannot move group to another campaign');
        }
        if (dto.lgaId) {
            await this.assertLgaInJigawaCampaign(existing.campaignId, dto.lgaId);
        }
        const { campaignId: _campaignId, ...data } = dto;
        return this.prisma.supportGroup.update({
            where: { id },
            data,
            include: this.include,
        });
    }
    async remove(user, id) {
        await this.findOne(user, id);
        await this.prisma.supportGroup.delete({ where: { id } });
        return { success: true, message: 'Support group deleted' };
    }
    async assertLgaInJigawaCampaign(campaignId, lgaId) {
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: campaignId },
            select: { state: { select: { code: true } } },
        });
        if (campaign.state.code !== 'JI') {
            throw new common_1.ForbiddenException('Only Jigawa LGAs are supported in this MVP');
        }
        const lga = await this.prisma.lGA.findFirst({
            where: { id: lgaId, state: { code: 'JI' } },
        });
        if (!lga) {
            throw new common_1.NotFoundException('LGA not found in Jigawa State');
        }
    }
};
exports.SupportGroupsService = SupportGroupsService;
exports.SupportGroupsService = SupportGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportGroupsService);
//# sourceMappingURL=support-groups.service.js.map