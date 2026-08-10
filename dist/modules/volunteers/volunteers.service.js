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
exports.VolunteersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const campaign_scope_1 = require("../../common/scoping/campaign-scope");
let VolunteersService = class VolunteersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        ward: {
            select: {
                id: true,
                name: true,
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
    async list(user, query) {
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const wardScopeId = (0, campaign_scope_1.getWardScopeId)(user);
        if (wardScopeId && query.wardId && query.wardId !== wardScopeId) {
            throw new common_1.ForbiddenException('You can only view volunteers in your assigned ward');
        }
        const where = {
            campaignId: query.campaignId,
            ...(wardScopeId
                ? { wardId: wardScopeId }
                : query.wardId && { wardId: query.wardId }),
            ...(query.role && { role: query.role }),
            ...(query.isVerified !== undefined && { isVerified: query.isVerified }),
            ...(query.search && {
                OR: [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { phoneNumber: { contains: query.search, mode: 'insensitive' } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        return this.prisma.volunteer.findMany({
            where,
            include: this.include,
            orderBy: [{ updatedAt: 'desc' }],
        });
    }
    async findOne(user, id) {
        const volunteer = await this.prisma.volunteer.findUnique({
            where: { id },
            include: this.include,
        });
        if (!volunteer) {
            throw new common_1.NotFoundException('Volunteer not found');
        }
        await this.assertCampaignAccess(user.sub, volunteer.campaignId);
        if (volunteer.wardId) {
            (0, campaign_scope_1.assertWardAccess)(user, volunteer.wardId);
        }
        return volunteer;
    }
    async create(user, dto) {
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        const wardScopeId = (0, campaign_scope_1.getWardScopeId)(user);
        const wardId = wardScopeId ?? dto.wardId;
        if (wardScopeId && dto.wardId && dto.wardId !== wardScopeId) {
            throw new common_1.ForbiddenException('You can only assign volunteers to your ward');
        }
        if (wardId) {
            await this.assertWardInJigawa(wardId);
            (0, campaign_scope_1.assertWardAccess)(user, wardId);
        }
        return this.prisma.volunteer.create({
            data: {
                campaignId: dto.campaignId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phoneNumber: dto.phoneNumber,
                email: dto.email,
                wardId,
                role: dto.role,
                performanceScore: dto.performanceScore ?? 0,
                isVerified: dto.isVerified ?? false,
            },
            include: this.include,
        });
    }
    async update(user, id, dto) {
        const existing = await this.findOne(user, id);
        if (dto.campaignId && dto.campaignId !== existing.campaignId) {
            throw new common_1.ForbiddenException('Cannot move volunteer to another campaign');
        }
        if (dto.wardId) {
            await this.assertWardInJigawa(dto.wardId);
            (0, campaign_scope_1.assertWardAccess)(user, dto.wardId);
        }
        else if (existing.wardId) {
            (0, campaign_scope_1.assertWardAccess)(user, existing.wardId);
        }
        const { campaignId: _campaignId, ...data } = dto;
        return this.prisma.volunteer.update({
            where: { id },
            data,
            include: this.include,
        });
    }
    async remove(user, id) {
        await this.findOne(user, id);
        await this.prisma.volunteer.delete({ where: { id } });
        return { success: true, message: 'Volunteer deleted' };
    }
    async assertWardInJigawa(wardId) {
        const ward = await this.prisma.ward.findFirst({
            where: { id: wardId, lga: { state: { code: 'JI' } } },
        });
        if (!ward) {
            throw new common_1.NotFoundException('Ward not found in Jigawa State');
        }
    }
};
exports.VolunteersService = VolunteersService;
exports.VolunteersService = VolunteersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VolunteersService);
//# sourceMappingURL=volunteers.service.js.map