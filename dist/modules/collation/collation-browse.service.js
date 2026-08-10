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
exports.CollationBrowseService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const db_1 = require("@electromon/db");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CollationBrowseService = class CollationBrowseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getContext(user) {
        if (!user.campaignId) {
            throw new common_1.ForbiddenException('Campaign membership required');
        }
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: user.campaignId },
            include: { state: true },
        });
        const trackedParties = (0, shared_1.normalizeTrackedParties)(campaign.trackedParties);
        const partyColumns = (0, shared_1.getPartyCodes)(trackedParties);
        return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            stateId: campaign.state.id,
            stateName: campaign.state.name.toUpperCase(),
            stateCode: campaign.state.code,
            role: user.role,
            scopeType: user.scopeType,
            scopeId: user.scopeId,
            clientPartyCode: campaign.clientPartyCode,
            trackedParties,
            partyColumns,
        };
    }
    async getCampaignPartyConfig(campaignId) {
        const campaign = await this.prisma.campaign.findUniqueOrThrow({
            where: { id: campaignId },
        });
        const trackedParties = (0, shared_1.normalizeTrackedParties)(campaign.trackedParties);
        return {
            trackedParties,
            clientPartyCode: campaign.clientPartyCode,
            partyColumns: (0, shared_1.getPartyCodes)(trackedParties),
        };
    }
    withPartyMeta(payload, partyConfig) {
        return {
            ...payload,
            trackedParties: partyConfig.trackedParties,
            clientPartyCode: partyConfig.clientPartyCode,
            partyColumns: partyConfig.partyColumns,
        };
    }
    async browseLgas(user, page = 1, limit = 20, search) {
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        if (this.isScopedToWard(user)) {
            throw new common_1.ForbiddenException('Ward officers can only access their assigned ward');
        }
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.LGA);
        const where = {
            stateId: context.stateId,
            ...(search
                ? { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } }
                : {}),
        };
        if (this.isScopedToLga(user)) {
            where.id = user.scopeId;
        }
        const [total, lgas] = await Promise.all([
            this.prisma.lGA.count({ where }),
            this.prisma.lGA.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        const results = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.LGA,
                scopeId: { in: lgas.map((l) => l.id) },
            },
        });
        const resultMap = new Map(results.map((r) => [r.scopeId, r]));
        return this.withPartyMeta({
            stateName: context.stateName,
            stateId: context.stateId,
            title: context.stateName,
            subtitle: 'List of Local Governments',
            level: 'LGA',
            data: lgas.map((lga, index) => {
                const parties = (0, shared_1.parsePartyTotals)(resultMap.get(lga.id)?.partyResults, partyConfig.partyColumns);
                return {
                    id: lga.id,
                    name: lga.name.toUpperCase(),
                    parties,
                    totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                    href: `/dashboard/lgas/${lga.id}`,
                    subtitle: `#${(page - 1) * limit + index + 1}`,
                };
            }),
            meta: this.buildMeta(page, limit, total),
        }, partyConfig);
    }
    async browseWards(user, lgaId, page = 1, limit = 20, search) {
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.WARD);
        const lga = await this.prisma.lGA.findFirst({
            where: { id: lgaId, stateId: context.stateId },
        });
        if (!lga)
            throw new common_1.NotFoundException('LGA not found');
        if (this.isScopedToLga(user) && user.scopeId !== lgaId) {
            throw new common_1.ForbiddenException('You can only browse wards in your assigned LGA');
        }
        const where = {
            lgaId,
            ...(search
                ? { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } }
                : {}),
        };
        if (this.isScopedToWard(user)) {
            where.id = user.scopeId;
        }
        const [total, wards] = await Promise.all([
            this.prisma.ward.count({ where }),
            this.prisma.ward.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        const results = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.WARD,
                scopeId: { in: wards.map((w) => w.id) },
            },
        });
        const resultMap = new Map(results.map((r) => [r.scopeId, r]));
        return this.withPartyMeta({
            stateName: context.stateName,
            stateId: context.stateId,
            title: lga.name.toUpperCase(),
            subtitle: 'List of Wards',
            level: 'WARD',
            parent: { id: lga.id, name: lga.name, href: '/dashboard/lgas' },
            data: wards.map((ward, index) => {
                const parties = (0, shared_1.parsePartyTotals)(resultMap.get(ward.id)?.partyResults, partyConfig.partyColumns);
                return {
                    id: ward.id,
                    name: ward.name.toUpperCase(),
                    parties,
                    totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                    href: `/dashboard/wards/${ward.id}`,
                    subtitle: ward.registrationAreaCode ?? `#${(page - 1) * limit + index + 1}`,
                };
            }),
            meta: this.buildMeta(page, limit, total),
        }, partyConfig);
    }
    async browseWardsForUser(user, page = 1, limit = 20, search) {
        if (!this.isScopedToLga(user)) {
            throw new common_1.ForbiddenException('This endpoint is for LGA-scoped users');
        }
        return this.browseWards(user, user.scopeId, page, limit, search);
    }
    async browsePollingUnits(user, wardId, page = 1, limit = 20, search) {
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.POLLING_UNIT);
        const ward = await this.prisma.ward.findFirst({
            where: { id: wardId, lga: { stateId: context.stateId } },
            include: { lga: true },
        });
        if (!ward)
            throw new common_1.NotFoundException('Ward not found');
        if (this.isScopedToLga(user) && ward.lgaId !== user.scopeId) {
            throw new common_1.ForbiddenException('Ward is outside your LGA scope');
        }
        if (this.isScopedToWard(user) && user.scopeId !== wardId) {
            throw new common_1.ForbiddenException('You can only browse polling units in your assigned ward');
        }
        const where = {
            wardId,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                        { code: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                    ],
                }
                : {}),
        };
        if (this.isScopedToPu(user)) {
            where.id = user.scopeId;
        }
        const [total, pollingUnits] = await Promise.all([
            this.prisma.pollingUnit.count({ where }),
            this.prisma.pollingUnit.findMany({
                where,
                orderBy: { code: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        const results = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeId: { in: pollingUnits.map((pu) => pu.id) },
            },
        });
        const resultMap = new Map(results.map((r) => [r.scopeId, r]));
        return this.withPartyMeta({
            stateName: context.stateName,
            stateId: context.stateId,
            title: ward.lga.name.toUpperCase(),
            subtitle: `Polling Stations — ${ward.name}`,
            level: 'POLLING_UNIT',
            parent: { id: ward.lga.id, name: ward.lga.name, href: `/dashboard/lgas/${ward.lga.id}` },
            data: pollingUnits.map((pu, index) => {
                const parties = (0, shared_1.parsePartyTotals)(resultMap.get(pu.id)?.partyResults, partyConfig.partyColumns);
                return {
                    id: pu.id,
                    name: pu.name.toUpperCase(),
                    code: pu.code,
                    parties,
                    totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                    href: `/dashboard/my-unit?id=${pu.id}`,
                    subtitle: pu.code ?? `#${(page - 1) * limit + index + 1}`,
                };
            }),
            meta: this.buildMeta(page, limit, total),
        }, partyConfig);
    }
    async browsePollingUnitsForUser(user, page = 1, limit = 20, search) {
        if (this.isScopedToPu(user)) {
            if (!user.scopeId) {
                throw new common_1.ForbiddenException('No polling unit assigned to your account');
            }
            const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
            const context = await this.getContext(user);
            const where = {
                id: user.scopeId,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                            { code: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                        ],
                    }
                    : {}),
            };
            const pollingUnit = await this.prisma.pollingUnit.findFirst({
                where: { ...where, ward: { lga: { stateId: context.stateId } } },
                include: { ward: { include: { lga: true } } },
            });
            if (!pollingUnit) {
                throw new common_1.NotFoundException('Assigned polling unit not found');
            }
            const result = await this.prisma.collationResult.findFirst({
                where: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.POLLING_UNIT,
                    scopeId: pollingUnit.id,
                },
            });
            const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
            return this.withPartyMeta({
                stateName: context.stateName,
                stateId: context.stateId,
                title: pollingUnit.ward.lga.name.toUpperCase(),
                subtitle: `My polling unit — ${pollingUnit.ward.name}`,
                level: 'POLLING_UNIT',
                parent: {
                    id: pollingUnit.ward.id,
                    name: pollingUnit.ward.name,
                    href: `/dashboard/wards/${pollingUnit.ward.id}`,
                },
                data: [
                    {
                        id: pollingUnit.id,
                        name: pollingUnit.name.toUpperCase(),
                        code: pollingUnit.code,
                        parties,
                        totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                        href: `/dashboard/my-unit?id=${pollingUnit.id}`,
                        subtitle: pollingUnit.code ?? pollingUnit.ward.name,
                    },
                ],
                meta: this.buildMeta(page, limit, 1),
            }, partyConfig);
        }
        if (this.isScopedToWard(user)) {
            return this.browsePollingUnits(user, user.scopeId, page, limit, search);
        }
        if (this.isScopedToLga(user)) {
            const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
            const where = {
                ward: { lgaId: user.scopeId },
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                            { code: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                        ],
                    }
                    : {}),
            };
            const [total, pollingUnits] = await Promise.all([
                this.prisma.pollingUnit.count({ where }),
                this.prisma.pollingUnit.findMany({
                    where,
                    orderBy: { code: 'asc' },
                    skip: (page - 1) * limit,
                    take: limit,
                    include: { ward: { include: { lga: true } } },
                }),
            ]);
            const results = await this.prisma.collationResult.findMany({
                where: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.POLLING_UNIT,
                    scopeId: { in: pollingUnits.map((pu) => pu.id) },
                },
            });
            const resultMap = new Map(results.map((r) => [r.scopeId, r]));
            const context = await this.getContext(user);
            return this.withPartyMeta({
                stateName: context.stateName,
                stateId: context.stateId,
                title: pollingUnits[0]?.ward.lga.name.toUpperCase() ?? 'LGA',
                subtitle: 'Polling Stations',
                level: 'POLLING_UNIT',
                data: pollingUnits.map((pu) => {
                    const parties = (0, shared_1.parsePartyTotals)(resultMap.get(pu.id)?.partyResults, partyConfig.partyColumns);
                    return {
                        id: pu.id,
                        name: pu.name.toUpperCase(),
                        code: pu.code,
                        parties,
                        totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                        href: `/dashboard/my-unit?id=${pu.id}`,
                        subtitle: pu.ward.name,
                    };
                }),
                meta: this.buildMeta(page, limit, total),
            }, partyConfig);
        }
        throw new common_1.ForbiddenException('This endpoint is for ward or LGA scoped users');
    }
    buildMeta(page, limit, total) {
        return {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    assertCanBrowseLevel(user, minLevel) {
        const role = user.role;
        const level = role ? (0, shared_1.getCollationLevelForRole)(role) : undefined;
        if (!level && role !== shared_1.CampaignRole.CAMPAIGN_DIRECTOR && role !== shared_1.CampaignRole.CANDIDATE) {
            throw new common_1.ForbiddenException('Insufficient permissions to browse this level');
        }
        const order = [shared_1.CollationLevel.POLLING_UNIT, shared_1.CollationLevel.WARD, shared_1.CollationLevel.LGA, shared_1.CollationLevel.STATE, shared_1.CollationLevel.NATIONAL];
        if (level && order.indexOf(level) < order.indexOf(minLevel)) {
        }
    }
    isScopedToPu(user) {
        return (user.scopeType === shared_1.ScopeType.POLLING_UNIT ||
            user.role === shared_1.CampaignRole.POLLING_UNIT_OFFICER ||
            user.role === shared_1.CampaignRole.POLLING_AGENT);
    }
    isScopedToWard(user) {
        return (user.scopeType === shared_1.ScopeType.WARD ||
            user.role === shared_1.CampaignRole.WARD_RA_OFFICER ||
            user.role === shared_1.CampaignRole.WARD_COORDINATOR);
    }
    isScopedToLga(user) {
        return (user.scopeType === shared_1.ScopeType.LGA ||
            user.role === shared_1.CampaignRole.LGA_COLLATION_OFFICER ||
            user.role === shared_1.CampaignRole.LGA_COORDINATOR);
    }
};
exports.CollationBrowseService = CollationBrowseService;
exports.CollationBrowseService = CollationBrowseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollationBrowseService);
//# sourceMappingURL=collation-browse.service.js.map