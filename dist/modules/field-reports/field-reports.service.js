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
exports.FieldReportsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const campaign_scope_1 = require("../../common/scoping/campaign-scope");
let FieldReportsService = class FieldReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        reporter: { select: { id: true, firstName: true, lastName: true } },
        handledBy: { select: { id: true, firstName: true, lastName: true } },
        ward: { select: { id: true, name: true } },
        pollingUnit: { select: { id: true, code: true, name: true } },
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
            throw new common_1.ForbiddenException('You can only view incidents in your assigned ward');
        }
        const effectiveWardId = wardScopeId ?? query.wardId;
        if (wardScopeId && query.pollingUnitId) {
            await (0, campaign_scope_1.assertPollingUnitInWard)(this.prisma, query.pollingUnitId, wardScopeId);
        }
        const where = {
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
    async create(user, dto) {
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        let wardId = dto.wardId;
        if (dto.pollingUnitId) {
            const stateId = (await this.prisma.campaign.findUniqueOrThrow({
                where: { id: dto.campaignId },
                select: { stateId: true },
            })).stateId;
            const unit = await this.prisma.pollingUnit.findFirst({
                where: { id: dto.pollingUnitId, ward: { lga: { stateId } } },
            });
            if (!unit)
                throw new common_1.NotFoundException('Polling unit not found in campaign state');
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
                status: shared_1.FieldReportStatus.OPEN,
            },
            include: this.include,
        });
    }
    async updateStatus(user, id, dto) {
        const report = await this.prisma.fieldReport.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Field report not found');
        await this.assertCampaignAccess(user.sub, report.campaignId);
        if ((0, campaign_scope_1.isWardScopedUser)(user)) {
            const wardScopeId = (0, campaign_scope_1.getWardScopeId)(user);
            const reportWardId = report.wardId ??
                (report.pollingUnitId
                    ? (await this.prisma.pollingUnit.findUnique({
                        where: { id: report.pollingUnitId },
                        select: { wardId: true },
                    }))?.wardId
                    : undefined);
            if (reportWardId !== wardScopeId) {
                throw new common_1.ForbiddenException('You can only manage incidents in your assigned ward');
            }
        }
        if (dto.status !== shared_1.FieldReportStatus.ESCALATED &&
            dto.status !== shared_1.FieldReportStatus.RESOLVED &&
            dto.status !== shared_1.FieldReportStatus.OPEN) {
            throw new common_1.ForbiddenException('Invalid status transition');
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
};
exports.FieldReportsService = FieldReportsService;
exports.FieldReportsService = FieldReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldReportsService);
//# sourceMappingURL=field-reports.service.js.map