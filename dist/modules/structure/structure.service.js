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
exports.StructureService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let StructureService = class StructureService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getCollationHierarchy() {
        const labels = {
            [shared_1.CollationLevel.POLLING_UNIT]: 'Polling Unit (PU)',
            [shared_1.CollationLevel.WARD]: 'Ward / Registration Area (RA)',
            [shared_1.CollationLevel.LGA]: 'Local Government Area (LGA)',
            [shared_1.CollationLevel.STATE]: 'State Collation Centre',
            [shared_1.CollationLevel.NATIONAL]: 'National Collation Centre (Abuja)',
        };
        return shared_1.COLLATION_HIERARCHY.map((level, index) => ({
            level,
            levelOrder: index + 1,
            label: labels[level],
            scopeType: shared_1.LEVEL_TO_SCOPE_TYPE[level],
            description: index === 0
                ? 'Lowest level; physical voting and initial count happens here.'
                : index === shared_1.COLLATION_HIERARCHY.length - 1
                    ? 'Highest level; final presidential announcement.'
                    : `Combines all units from ${labels[shared_1.COLLATION_HIERARCHY[index - 1]]}.`,
            approvesFrom: index > 0 ? shared_1.COLLATION_HIERARCHY[index - 1] : null,
            submitsTo: index < shared_1.COLLATION_HIERARCHY.length - 1 ? shared_1.COLLATION_HIERARCHY[index + 1] : null,
            dashboardRoute: level === shared_1.CollationLevel.POLLING_UNIT
                ? '/dashboard/polling-unit'
                : level === shared_1.CollationLevel.WARD
                    ? '/dashboard/ward'
                    : level === shared_1.CollationLevel.LGA
                        ? '/dashboard/lga'
                        : level === shared_1.CollationLevel.STATE
                            ? '/dashboard/state'
                            : '/dashboard/national',
        }));
    }
    getStates() {
        return this.prisma.state.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { lgas: true, campaigns: true } },
            },
        });
    }
    getLgasByState(stateId) {
        return this.prisma.lGA.findMany({
            where: { stateId },
            orderBy: { name: 'asc' },
            include: {
                senatorialDistrict: true,
                _count: { select: { wards: true } },
            },
        });
    }
    getWardsByLga(lgaId) {
        return this.prisma.ward.findMany({
            where: { lgaId },
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { pollingUnits: true, volunteers: true } },
            },
        });
    }
    getPollingUnitsByWard(wardId) {
        return this.prisma.pollingUnit.findMany({
            where: { wardId },
            orderBy: { code: 'asc' },
        });
    }
    async getCoverageStats(campaignId) {
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: campaignId },
            include: { state: true },
        });
        const [totalLgas, totalWards, totalPollingUnits, assignedCoordinators] = await Promise.all([
            this.prisma.lGA.count({ where: { stateId: campaign.stateId } }),
            this.prisma.ward.count({
                where: { lga: { stateId: campaign.stateId } },
            }),
            this.prisma.pollingUnit.count({
                where: { ward: { lga: { stateId: campaign.stateId } } },
            }),
            this.prisma.campaignMembership.count({
                where: {
                    campaignId,
                    isActive: true,
                    role: {
                        in: [
                            shared_1.CampaignRole.LGA_COORDINATOR,
                            shared_1.CampaignRole.WARD_COORDINATOR,
                            shared_1.CampaignRole.STATE_COORDINATOR,
                            shared_1.CampaignRole.POLLING_UNIT_OFFICER,
                            shared_1.CampaignRole.WARD_RA_OFFICER,
                            shared_1.CampaignRole.LGA_COLLATION_OFFICER,
                            shared_1.CampaignRole.STATE_COLLATION_OFFICER,
                            shared_1.CampaignRole.NATIONAL_COLLATION_OFFICER,
                        ],
                    },
                },
            }),
        ]);
        return {
            campaignId,
            state: campaign.state.name,
            totalLgas,
            totalWards,
            totalPollingUnits,
            assignedCoordinators,
        };
    }
};
exports.StructureService = StructureService;
exports.StructureService = StructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StructureService);
//# sourceMappingURL=structure.service.js.map