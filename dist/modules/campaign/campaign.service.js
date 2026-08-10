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
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CampaignService = class CampaignService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listForUser(userId) {
        return this.prisma.campaign.findMany({
            where: {
                memberships: { some: { userId, isActive: true } },
            },
            include: {
                state: true,
                _count: {
                    select: {
                        supportGroups: true,
                        volunteers: true,
                        fieldReports: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                state: {
                    include: {
                        lgas: {
                            include: {
                                wards: {
                                    include: {
                                        _count: { select: { pollingUnits: true } },
                                    },
                                },
                            },
                        },
                        senatorialDistricts: true,
                    },
                },
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campaign not found');
        }
        return campaign;
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map