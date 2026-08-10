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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertCampaignAccess(userId, campaignId) {
        const membership = await this.prisma.campaignMembership.findFirst({
            where: { userId, campaignId, isActive: true },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this campaign');
        }
    }
    async getOverview(user, campaignId) {
        await this.assertCampaignAccess(user.sub, campaignId);
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: campaignId },
            include: { state: true },
        });
        const stateId = campaign.stateId;
        const puStateFilter = { ward: { lga: { stateId } } };
        const [supportGroups, activeSupportGroups, volunteers, verifiedVolunteers, commitments, activeCommitments, completedCommitments, commitmentAgg, pollingUnits, assignedPollingUnits, puStrong, puSwing, puWeak, fieldReports, urgentFieldReports, situationUpdates, urgentSituations, incidents, topVolunteers, recentFieldReports, recentSituations, recentCommitments, lgas,] = await Promise.all([
            this.prisma.supportGroup.count({ where: { campaignId } }),
            this.prisma.supportGroup.count({ where: { campaignId, verificationStatus: 'ACTIVE' } }),
            this.prisma.volunteer.count({ where: { campaignId } }),
            this.prisma.volunteer.count({ where: { campaignId, isVerified: true } }),
            this.prisma.commitment.count({ where: { campaignId } }),
            this.prisma.commitment.count({ where: { campaignId, status: 'ACTIVE' } }),
            this.prisma.commitment.count({ where: { campaignId, status: 'COMPLETED' } }),
            this.prisma.commitment.aggregate({
                where: { campaignId },
                _sum: { targetValue: true, currentValue: true },
            }),
            this.prisma.pollingUnit.count({ where: puStateFilter }),
            this.prisma.pollingUnit.count({
                where: { ...puStateFilter, assignedAgentId: { not: null } },
            }),
            this.prisma.pollingUnit.count({ where: { ...puStateFilter, strengthAssessment: 'STRONG' } }),
            this.prisma.pollingUnit.count({ where: { ...puStateFilter, strengthAssessment: 'SWING' } }),
            this.prisma.pollingUnit.count({ where: { ...puStateFilter, strengthAssessment: 'WEAK' } }),
            this.prisma.fieldReport.count({ where: { campaignId } }),
            this.prisma.fieldReport.count({ where: { campaignId, isUrgent: true } }),
            this.prisma.situationUpdate.count({
                where: { pollingUnit: { ward: { lga: { state: { campaigns: { some: { id: campaignId } } } } } } },
            }),
            this.prisma.situationUpdate.count({
                where: {
                    isUrgent: true,
                    pollingUnit: { ward: { lga: { state: { campaigns: { some: { id: campaignId } } } } } },
                },
            }),
            this.prisma.situationUpdate.count({
                where: {
                    status: 'INCIDENT',
                    pollingUnit: { ward: { lga: { state: { campaigns: { some: { id: campaignId } } } } } },
                },
            }),
            this.prisma.volunteer.findMany({
                where: { campaignId },
                orderBy: { performanceScore: 'desc' },
                take: 5,
                select: { id: true, firstName: true, lastName: true, role: true, performanceScore: true },
            }),
            this.prisma.fieldReport.findMany({
                where: { campaignId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, title: true, type: true, isUrgent: true, createdAt: true },
            }),
            this.prisma.situationUpdate.findMany({
                where: { pollingUnit: { ward: { lga: { stateId } } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { pollingUnit: { select: { code: true, name: true } } },
            }),
            this.prisma.commitment.findMany({
                where: { campaignId },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                include: { supportGroup: { select: { name: true } } },
            }),
            this.prisma.lGA.findMany({
                where: { stateId },
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            wards: true,
                        },
                    },
                },
            }),
        ]);
        const totalTarget = commitmentAgg._sum.targetValue ?? 0;
        const totalCurrent = commitmentAgg._sum.currentValue ?? 0;
        const unassessed = pollingUnits - puStrong - puSwing - puWeak;
        const lgaCoverage = await Promise.all(lgas.map(async (lga) => {
            const [puCount, assigned, volCount] = await Promise.all([
                this.prisma.pollingUnit.count({ where: { ward: { lgaId: lga.id } } }),
                this.prisma.pollingUnit.count({
                    where: { ward: { lgaId: lga.id }, assignedAgentId: { not: null } },
                }),
                this.prisma.volunteer.count({ where: { campaignId, ward: { lgaId: lga.id } } }),
            ]);
            return {
                lgaId: lga.id,
                lgaName: lga.name,
                pollingUnits: puCount,
                assignedAgents: assigned,
                volunteers: volCount,
            };
        }));
        const recentActivity = [
            ...recentFieldReports.map((r) => ({
                type: 'field_report',
                id: r.id,
                title: r.title,
                subtitle: r.type.replace(/_/g, ' '),
                isUrgent: r.isUrgent,
                createdAt: r.createdAt,
            })),
            ...recentSituations.map((s) => ({
                type: 'situation_update',
                id: s.id,
                title: `${s.pollingUnit.code} — ${s.status}`,
                subtitle: s.pollingUnit.name,
                isUrgent: s.isUrgent,
                createdAt: s.createdAt,
            })),
            ...recentCommitments.map((c) => ({
                type: 'commitment',
                id: c.id,
                title: c.title,
                subtitle: c.supportGroup.name,
                isUrgent: false,
                createdAt: c.updatedAt,
            })),
        ]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 8);
        return {
            campaignId,
            state: campaign.state.name,
            counts: {
                supportGroups,
                activeSupportGroups,
                volunteers,
                verifiedVolunteers,
                commitments,
                activeCommitments,
                completedCommitments,
                pollingUnits,
                assignedPollingUnits,
                fieldReports,
                urgentFieldReports,
                situationUpdates,
                urgentSituations,
                incidents,
            },
            commitmentProgress: {
                totalTarget,
                totalCurrent,
                percent: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
            },
            pollingUnitStrength: {
                strong: puStrong,
                swing: puSwing,
                weak: puWeak,
                unassessed: Math.max(0, unassessed),
            },
            topVolunteers,
            recentActivity,
            lgaCoverage: lgaCoverage.filter((l) => l.pollingUnits > 0 || l.volunteers > 0).slice(0, 10),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map