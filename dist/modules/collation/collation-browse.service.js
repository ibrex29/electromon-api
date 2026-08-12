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
function emptyIncidentBucket() {
    return { count: 0, urgent: 0, weight: 0, maxSeverity: null };
}
function severityWeight(severity) {
    switch (severity) {
        case 'CRITICAL':
            return 4;
        case 'HIGH':
            return 3;
        case 'MEDIUM':
            return 2;
        case 'LOW':
        default:
            return 1;
    }
}
function severityRank(severity) {
    return severityWeight(severity);
}
function bumpIncident(map, id, weight, urgent, severity) {
    const current = map.get(id) ?? emptyIncidentBucket();
    const nextSeverity = !current.maxSeverity || severityRank(severity) > severityRank(current.maxSeverity)
        ? severity
        : current.maxSeverity;
    map.set(id, {
        count: current.count + 1,
        urgent: current.urgent + urgent,
        weight: current.weight + weight,
        maxSeverity: nextSeverity,
    });
}
function computeOutcome(parties, partyColumns, clientPartyCode) {
    let max = 0;
    for (const code of partyColumns) {
        max = Math.max(max, parties[code] ?? 0);
    }
    if (max <= 0)
        return { outcome: 'PENDING', leadingParty: null, margin: 0 };
    const leaders = partyColumns.filter((code) => (parties[code] ?? 0) === max);
    const leadingParty = leaders[0] ?? null;
    const clientVotes = clientPartyCode ? (parties[clientPartyCode] ?? 0) : 0;
    const margin = max - clientVotes;
    if (!clientPartyCode)
        return { outcome: 'PENDING', leadingParty, margin };
    if (leaders.includes(clientPartyCode) && leaders.length > 1) {
        return { outcome: 'TIE', leadingParty: clientPartyCode, margin: 0 };
    }
    if (leaders[0] === clientPartyCode) {
        const second = Math.max(0, ...partyColumns
            .filter((code) => code !== clientPartyCode)
            .map((code) => parties[code] ?? 0));
        return { outcome: 'WIN', leadingParty: clientPartyCode, margin: clientVotes - second };
    }
    return { outcome: 'LOSS', leadingParty, margin };
}
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
            subtitle: this.isScopedToLga(user)
                ? 'Wards in your LGA'
                : `Wards in ${lga.name} LGA`,
            level: 'WARD',
            parent: this.isScopedToLga(user)
                ? undefined
                : {
                    id: context.stateId,
                    name: 'Local Governments',
                    href: '/dashboard/lgas',
                },
            data: wards.map((ward, index) => {
                const result = resultMap.get(ward.id);
                const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                return {
                    id: ward.id,
                    name: ward.name.toUpperCase(),
                    code: ward.registrationAreaCode ?? undefined,
                    parties,
                    totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                    href: `/dashboard/wards/${ward.id}`,
                    subtitle: ward.registrationAreaCode ?? `#${(page - 1) * limit + index + 1}`,
                    resultStatus: result?.status ?? 'NOT_STARTED',
                    latitude: ward.latitude,
                    longitude: ward.longitude,
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
        const parent = this.isScopedToWard(user)
            ? undefined
            : this.isScopedToLga(user)
                ? {
                    id: ward.lga.id,
                    name: `${ward.lga.name} LGA`,
                    href: '/dashboard/my-lga',
                }
                : {
                    id: ward.lga.id,
                    name: `${ward.lga.name} LGA`,
                    href: `/dashboard/lgas/${ward.lga.id}`,
                };
        return this.withPartyMeta({
            stateName: context.stateName,
            stateId: context.stateId,
            title: ward.name.toUpperCase(),
            subtitle: this.isScopedToWard(user)
                ? `Polling stations · ${ward.lga.name} LGA`
                : `Polling stations · ${ward.lga.name} LGA`,
            level: 'POLLING_UNIT',
            parent,
            data: pollingUnits.map((pu, index) => {
                const result = resultMap.get(pu.id);
                const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                return {
                    id: pu.id,
                    name: pu.name.toUpperCase(),
                    code: pu.code,
                    parties,
                    totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                    href: `/dashboard/my-unit?id=${pu.id}`,
                    subtitle: pu.code ?? `#${(page - 1) * limit + index + 1}`,
                    resultStatus: result?.status ?? 'NOT_STARTED',
                    latitude: pu.latitude,
                    longitude: pu.longitude,
                };
            }),
            meta: this.buildMeta(page, limit, total),
        }, partyConfig);
    }
    async browsePollingUnitsForUser(user, page = 1, limit = 20, search, filters) {
        const safeLimit = Math.min(100, Math.max(1, limit));
        const safePage = Math.max(1, page);
        const q = search?.trim();
        const searchWhere = q
            ? {
                OR: [
                    { name: { contains: q, mode: db_1.Prisma.QueryMode.insensitive } },
                    { code: { contains: q, mode: db_1.Prisma.QueryMode.insensitive } },
                    { ward: { name: { contains: q, mode: db_1.Prisma.QueryMode.insensitive } } },
                    { ward: { lga: { name: { contains: q, mode: db_1.Prisma.QueryMode.insensitive } } } },
                ],
            }
            : undefined;
        if (this.isScopedToPu(user)) {
            if (!user.scopeId) {
                throw new common_1.ForbiddenException('No polling unit assigned to your account');
            }
            const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
            const context = await this.getContext(user);
            const where = {
                id: user.scopeId,
                ...(searchWhere ?? {}),
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
                title: pollingUnit.name.toUpperCase(),
                subtitle: `My polling unit · ${pollingUnit.ward.name} · ${pollingUnit.ward.lga.name} LGA`,
                level: 'POLLING_UNIT',
                parent: undefined,
                data: [
                    {
                        id: pollingUnit.id,
                        name: pollingUnit.name.toUpperCase(),
                        code: pollingUnit.code,
                        parties,
                        totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                        href: `/dashboard/my-unit?id=${pollingUnit.id}`,
                        subtitle: `${pollingUnit.ward.name} · ${pollingUnit.ward.lga.name}`,
                    },
                ],
                meta: this.buildMeta(safePage, safeLimit, 1),
            }, partyConfig);
        }
        if (this.isScopedToWard(user)) {
            return this.browsePollingUnits(user, user.scopeId, safePage, safeLimit, search);
        }
        if (this.isScopedToLga(user)) {
            const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
            let where = {
                ward: {
                    lgaId: user.scopeId,
                    ...(filters?.wardId ? { id: filters.wardId } : {}),
                },
                ...(searchWhere ?? {}),
            };
            where = await this.applyHasResultsFilter(where, user.campaignId, filters?.hasResults);
            const [total, pollingUnits] = await Promise.all([
                this.prisma.pollingUnit.count({ where }),
                this.prisma.pollingUnit.findMany({
                    where,
                    orderBy: { code: 'asc' },
                    skip: (safePage - 1) * safeLimit,
                    take: safeLimit,
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
                subtitle: 'Polling stations in your LGA',
                level: 'POLLING_UNIT',
                parent: undefined,
                data: pollingUnits.map((pu) => {
                    const result = resultMap.get(pu.id);
                    const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                    return {
                        id: pu.id,
                        name: pu.name.toUpperCase(),
                        code: pu.code,
                        parties,
                        totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                        href: `/dashboard/my-unit?id=${pu.id}`,
                        subtitle: pu.ward.name,
                        resultStatus: result?.status ?? 'NOT_STARTED',
                    };
                }),
                meta: this.buildMeta(safePage, safeLimit, total),
            }, partyConfig);
        }
        if ((0, shared_1.isCampaignAdminRole)(user.role) || user.role === shared_1.CampaignRole.STATE_COLLATION_OFFICER) {
            const context = await this.getContext(user);
            const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
            let where = {
                ward: {
                    lga: { stateId: context.stateId },
                    ...(filters?.lgaId ? { lgaId: filters.lgaId } : {}),
                    ...(filters?.wardId ? { id: filters.wardId } : {}),
                },
                ...(searchWhere ?? {}),
            };
            where = await this.applyHasResultsFilter(where, user.campaignId, filters?.hasResults);
            const [total, pollingUnits] = await Promise.all([
                this.prisma.pollingUnit.count({ where }),
                this.prisma.pollingUnit.findMany({
                    where,
                    orderBy: [{ ward: { lga: { name: 'asc' } } }, { code: 'asc' }],
                    skip: (safePage - 1) * safeLimit,
                    take: safeLimit,
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
            const filterLabel = [
                filters?.lgaId && pollingUnits[0]?.ward.lga.name,
                filters?.wardId && pollingUnits[0]?.ward.name,
            ]
                .filter(Boolean)
                .join(' · ');
            return this.withPartyMeta({
                stateName: context.stateName,
                stateId: context.stateId,
                title: context.stateName,
                subtitle: filterLabel
                    ? `Polling stations · ${filterLabel}`
                    : filters?.hasResults === true
                        ? 'Polling stations with submitted results'
                        : filters?.hasResults === false
                            ? 'Polling stations not yet started'
                            : 'All polling stations in the campaign state',
                level: 'POLLING_UNIT',
                parent: undefined,
                data: pollingUnits.map((pu) => {
                    const result = resultMap.get(pu.id);
                    const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                    return {
                        id: pu.id,
                        name: pu.name.toUpperCase(),
                        code: pu.code,
                        parties,
                        totalVotes: Object.values(parties).reduce((sum, n) => sum + n, 0),
                        href: `/dashboard/my-unit?id=${pu.id}`,
                        subtitle: `${pu.ward.name} · ${pu.ward.lga.name}`,
                        resultStatus: result?.status ?? 'NOT_STARTED',
                    };
                }),
                meta: this.buildMeta(safePage, safeLimit, total),
            }, partyConfig);
        }
        throw new common_1.ForbiddenException('This endpoint is for ward or LGA scoped users');
    }
    async applyHasResultsFilter(where, campaignId, hasResults) {
        if (hasResults === undefined)
            return where;
        const rows = await this.prisma.collationResult.findMany({
            where: { campaignId, level: shared_1.CollationLevel.POLLING_UNIT },
            select: { scopeId: true },
        });
        const ids = rows.map((r) => r.scopeId);
        if (hasResults) {
            return {
                AND: [where, { id: { in: ids.length ? ids : ['__none__'] } }],
            };
        }
        return {
            AND: [where, ...(ids.length ? [{ id: { notIn: ids } }] : [])],
        };
    }
    async situationMapPoints(user, filters) {
        if (!filters.lgaId && !filters.wardId) {
            return this.situationMapOverview(user);
        }
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.POLLING_UNIT);
        if (this.isScopedToWard(user)) {
            filters = { wardId: user.scopeId };
        }
        else if (this.isScopedToLga(user)) {
            if (filters.lgaId && filters.lgaId !== user.scopeId) {
                throw new common_1.ForbiddenException('You can only map your assigned LGA');
            }
            filters = { ...filters, lgaId: user.scopeId };
        }
        else if (this.isScopedToPu(user)) {
            throw new common_1.ForbiddenException('Polling agents cannot browse the situation map tree');
        }
        const where = {
            ward: {
                lga: { stateId: context.stateId },
                ...(filters.lgaId ? { lgaId: filters.lgaId } : {}),
                ...(filters.wardId ? { id: filters.wardId } : {}),
            },
        };
        const pollingUnits = await this.prisma.pollingUnit.findMany({
            where,
            orderBy: { code: 'asc' },
            take: 600,
            select: {
                id: true,
                name: true,
                code: true,
                latitude: true,
                longitude: true,
                wardId: true,
                ward: {
                    select: {
                        id: true,
                        name: true,
                        registrationAreaCode: true,
                        lgaId: true,
                        lga: { select: { id: true, name: true } },
                    },
                },
            },
        });
        const results = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeId: { in: pollingUnits.map((pu) => pu.id) },
            },
            select: { scopeId: true, status: true, partyResults: true },
        });
        const resultMap = new Map(results.map((r) => [r.scopeId, r]));
        const wardIds = [...new Set(pollingUnits.map((pu) => pu.wardId))];
        const wards = await this.prisma.ward.findMany({
            where: { id: { in: wardIds } },
            select: {
                id: true,
                name: true,
                registrationAreaCode: true,
                latitude: true,
                longitude: true,
                lgaId: true,
            },
        });
        const wardResults = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.WARD,
                scopeId: { in: wardIds },
            },
            select: { scopeId: true, status: true, partyResults: true },
        });
        const wardResultMap = new Map(wardResults.map((r) => [r.scopeId, r]));
        const incidentStats = await this.aggregateIncidentsByScope(user.campaignId, {
            wardIds,
            pollingUnitIds: pollingUnits.map((pu) => pu.id),
        });
        return this.withPartyMeta({
            mode: 'detail',
            lgaId: filters.lgaId ?? pollingUnits[0]?.ward.lgaId ?? null,
            wardId: filters.wardId ?? null,
            lgas: [],
            wards: wards.map((ward) => {
                const result = wardResultMap.get(ward.id);
                const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                const incidents = incidentStats.byWard.get(ward.id) ?? emptyIncidentBucket();
                return this.mapOutcomeRow({
                    id: ward.id,
                    name: ward.name.toUpperCase(),
                    code: ward.registrationAreaCode ?? undefined,
                    parties,
                    partyColumns: partyConfig.partyColumns,
                    clientPartyCode: partyConfig.clientPartyCode,
                    resultStatus: result?.status ?? 'NOT_STARTED',
                    latitude: ward.latitude,
                    longitude: ward.longitude,
                    href: `/dashboard/wards/${ward.id}`,
                    incidentCount: incidents.count,
                    incidentUrgentCount: incidents.urgent,
                    incidentWeight: incidents.weight,
                    maxSeverity: incidents.maxSeverity,
                });
            }),
            pollingUnits: pollingUnits.map((pu) => {
                const result = resultMap.get(pu.id);
                const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                const incidents = incidentStats.byPu.get(pu.id) ?? emptyIncidentBucket();
                return {
                    ...this.mapOutcomeRow({
                        id: pu.id,
                        name: pu.name.toUpperCase(),
                        code: pu.code,
                        parties,
                        partyColumns: partyConfig.partyColumns,
                        clientPartyCode: partyConfig.clientPartyCode,
                        resultStatus: result?.status ?? 'NOT_STARTED',
                        latitude: pu.latitude,
                        longitude: pu.longitude,
                        href: `/dashboard/my-unit?id=${pu.id}`,
                        incidentCount: incidents.count,
                        incidentUrgentCount: incidents.urgent,
                        incidentWeight: incidents.weight,
                        maxSeverity: incidents.maxSeverity,
                    }),
                    wardId: pu.wardId,
                    wardName: pu.ward.name.toUpperCase(),
                    registrationAreaCode: pu.ward.registrationAreaCode ?? undefined,
                };
            }),
        }, partyConfig);
    }
    async situationMapOverview(user) {
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.LGA);
        const where = { stateId: context.stateId };
        if (this.isScopedToLga(user))
            where.id = user.scopeId;
        if (this.isScopedToWard(user) || this.isScopedToPu(user)) {
            throw new common_1.ForbiddenException('Insufficient scope for statewide situation map');
        }
        const lgas = await this.prisma.lGA.findMany({
            where,
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
        });
        const results = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.LGA,
                scopeId: { in: lgas.map((l) => l.id) },
            },
            select: { scopeId: true, status: true, partyResults: true },
        });
        const resultMap = new Map(results.map((r) => [r.scopeId, r]));
        const incidentStats = await this.aggregateIncidentsByScope(user.campaignId, {
            lgaIds: lgas.map((l) => l.id),
        });
        return this.withPartyMeta({
            mode: 'overview',
            lgaId: null,
            wardId: null,
            lgas: lgas.map((lga) => {
                const result = resultMap.get(lga.id);
                const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
                const incidents = incidentStats.byLga.get(lga.id) ?? emptyIncidentBucket();
                return this.mapOutcomeRow({
                    id: lga.id,
                    name: lga.name.toUpperCase(),
                    parties,
                    partyColumns: partyConfig.partyColumns,
                    clientPartyCode: partyConfig.clientPartyCode,
                    resultStatus: result?.status ?? 'NOT_STARTED',
                    href: `/dashboard/lgas/${lga.id}`,
                    incidentCount: incidents.count,
                    incidentUrgentCount: incidents.urgent,
                    incidentWeight: incidents.weight,
                    maxSeverity: incidents.maxSeverity,
                });
            }),
            wards: [],
            pollingUnits: [],
        }, partyConfig);
    }
    async getRaceAnalytics(user) {
        const context = await this.getContext(user);
        const partyConfig = await this.getCampaignPartyConfig(user.campaignId);
        this.assertCanBrowseLevel(user, shared_1.CollationLevel.LGA);
        if (this.isScopedToWard(user) || this.isScopedToPu(user)) {
            throw new common_1.ForbiddenException('Race analytics requires LGA or higher scope');
        }
        const lgaWhere = { stateId: context.stateId };
        if (this.isScopedToLga(user))
            lgaWhere.id = user.scopeId;
        const lgas = await this.prisma.lGA.findMany({
            where: lgaWhere,
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
        });
        const lgaIds = lgas.map((l) => l.id);
        const [lgaResults, puTotal, reportedInState, openIncidents, urgentIncidents] = await Promise.all([
            this.prisma.collationResult.findMany({
                where: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.LGA,
                    scopeId: { in: lgaIds },
                },
                select: { scopeId: true, status: true, partyResults: true, votesCast: true },
            }),
            this.prisma.pollingUnit.count({
                where: { ward: { lgaId: { in: lgaIds } } },
            }),
            this.prisma.collationResult.findMany({
                where: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.POLLING_UNIT,
                },
                select: { scopeId: true },
            }),
            this.prisma.fieldReport.count({
                where: {
                    campaignId: user.campaignId,
                    type: { in: [shared_1.FieldReportType.INCIDENT, shared_1.FieldReportType.SECURITY_CONCERN] },
                    status: { not: 'RESOLVED' },
                    OR: [
                        { ward: { lgaId: { in: lgaIds } } },
                        { pollingUnit: { ward: { lgaId: { in: lgaIds } } } },
                    ],
                },
            }),
            this.prisma.fieldReport.count({
                where: {
                    campaignId: user.campaignId,
                    type: { in: [shared_1.FieldReportType.INCIDENT, shared_1.FieldReportType.SECURITY_CONCERN] },
                    status: { not: 'RESOLVED' },
                    OR: [{ isUrgent: true }, { incidentSeverity: { in: ['HIGH', 'CRITICAL'] } }],
                    AND: [
                        {
                            OR: [
                                { ward: { lgaId: { in: lgaIds } } },
                                { pollingUnit: { ward: { lgaId: { in: lgaIds } } } },
                            ],
                        },
                    ],
                },
            }),
        ]);
        const reportedIds = reportedInState.map((r) => r.scopeId);
        const puWithResult = reportedIds.length === 0
            ? 0
            : await this.prisma.pollingUnit.count({
                where: {
                    id: { in: reportedIds },
                    ward: { lgaId: { in: lgaIds } },
                },
            });
        const resultByLga = new Map(lgaResults.map((r) => [r.scopeId, r]));
        const partyTotals = (0, shared_1.emptyPartyTotals)(partyConfig.partyColumns);
        const lgaRows = [];
        let wins = 0;
        let losses = 0;
        let ties = 0;
        let pending = 0;
        for (const lga of lgas) {
            const result = resultByLga.get(lga.id);
            const parties = (0, shared_1.parsePartyTotals)(result?.partyResults, partyConfig.partyColumns);
            const totalVotes = Object.values(parties).reduce((sum, n) => sum + n, 0);
            for (const code of partyConfig.partyColumns) {
                partyTotals[code] = (partyTotals[code] ?? 0) + (parties[code] ?? 0);
            }
            const { outcome, leadingParty, margin } = computeOutcome(parties, partyConfig.partyColumns, partyConfig.clientPartyCode);
            const clientVotes = partyConfig.clientPartyCode
                ? (parties[partyConfig.clientPartyCode] ?? 0)
                : 0;
            if (outcome === 'WIN')
                wins += 1;
            else if (outcome === 'LOSS')
                losses += 1;
            else if (outcome === 'TIE')
                ties += 1;
            else
                pending += 1;
            lgaRows.push({
                id: lga.id,
                name: lga.name.toUpperCase(),
                parties,
                totalVotes,
                clientVotes,
                margin,
                outcome,
                leadingParty,
                resultStatus: result?.status ?? 'NOT_STARTED',
                share: totalVotes > 0 && partyConfig.clientPartyCode
                    ? Math.round((clientVotes / totalVotes) * 1000) / 10
                    : 0,
            });
        }
        const statewideTotal = Object.values(partyTotals).reduce((sum, n) => sum + n, 0);
        const clientCode = partyConfig.clientPartyCode ?? 'APC';
        const clientVotes = partyTotals[clientCode] ?? 0;
        const rankedParties = partyConfig.partyColumns
            .map((code) => ({
            code,
            name: partyConfig.trackedParties.find((p) => p.code === code)?.name ?? code,
            votes: partyTotals[code] ?? 0,
            share: statewideTotal > 0 ? Math.round(((partyTotals[code] ?? 0) / statewideTotal) * 1000) / 10 : 0,
        }))
            .sort((a, b) => b.votes - a.votes);
        const rival = rankedParties.find((p) => p.code !== clientCode);
        const raceLead = clientVotes - (rival?.votes ?? 0);
        const biggestLeads = [...lgaRows]
            .filter((r) => r.outcome === 'WIN')
            .sort((a, b) => b.margin - a.margin)
            .slice(0, 8);
        const biggestDeficits = [...lgaRows]
            .filter((r) => r.outcome === 'LOSS')
            .sort((a, b) => b.margin - a.margin)
            .slice(0, 8);
        const closestRaces = [...lgaRows]
            .filter((r) => r.outcome !== 'PENDING' && r.totalVotes > 0)
            .sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin))
            .slice(0, 8);
        const reportingPct = puTotal > 0 ? Math.round((puWithResult / puTotal) * 1000) / 10 : 0;
        return this.withPartyMeta({
            stateName: context.stateName,
            stateId: context.stateId,
            clientPartyCode: clientCode,
            summary: {
                lgaCount: lgas.length,
                wins,
                losses,
                ties,
                pending,
                statewideTotalVotes: statewideTotal,
                clientVotes,
                raceLead,
                rivalCode: rival?.code ?? null,
                rivalVotes: rival?.votes ?? 0,
                reporting: {
                    pollingUnitsTotal: puTotal,
                    pollingUnitsReported: puWithResult,
                    percent: reportingPct,
                },
                incidents: {
                    open: openIncidents,
                    urgent: urgentIncidents,
                },
            },
            partyStandings: rankedParties,
            lgas: lgaRows.sort((a, b) => a.name.localeCompare(b.name)),
            biggestLeads,
            biggestDeficits,
            closestRaces,
        }, partyConfig);
    }
    mapOutcomeRow(input) {
        const totalVotes = Object.values(input.parties).reduce((sum, n) => sum + n, 0);
        const { outcome, leadingParty, margin } = computeOutcome(input.parties, input.partyColumns, input.clientPartyCode);
        return {
            id: input.id,
            name: input.name,
            code: input.code,
            parties: input.parties,
            totalVotes,
            resultStatus: input.resultStatus,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            href: input.href,
            outcome,
            leadingParty,
            margin,
            incidentCount: input.incidentCount,
            incidentUrgentCount: input.incidentUrgentCount,
            incidentWeight: input.incidentWeight,
            maxSeverity: input.maxSeverity,
        };
    }
    async aggregateIncidentsByScope(campaignId, scope) {
        const or = [];
        if (scope.wardIds?.length)
            or.push({ wardId: { in: scope.wardIds } });
        if (scope.pollingUnitIds?.length)
            or.push({ pollingUnitId: { in: scope.pollingUnitIds } });
        if (scope.lgaIds?.length) {
            or.push({ ward: { lgaId: { in: scope.lgaIds } } });
            or.push({ pollingUnit: { ward: { lgaId: { in: scope.lgaIds } } } });
        }
        if (!or.length) {
            return {
                byLga: new Map(),
                byWard: new Map(),
                byPu: new Map(),
            };
        }
        const reports = await this.prisma.fieldReport.findMany({
            where: {
                campaignId,
                type: { in: [shared_1.FieldReportType.INCIDENT, shared_1.FieldReportType.SECURITY_CONCERN] },
                status: { not: 'RESOLVED' },
                OR: or,
            },
            select: {
                wardId: true,
                pollingUnitId: true,
                isUrgent: true,
                incidentSeverity: true,
                ward: { select: { id: true, lgaId: true } },
                pollingUnit: { select: { id: true, wardId: true, ward: { select: { lgaId: true } } } },
            },
        });
        const byLga = new Map();
        const byWard = new Map();
        const byPu = new Map();
        for (const report of reports) {
            const severity = report.incidentSeverity ?? (report.isUrgent ? 'HIGH' : 'LOW');
            const weight = severityWeight(severity);
            const urgent = report.isUrgent || severity === 'HIGH' || severity === 'CRITICAL' ? 1 : 0;
            const lgaId = report.ward?.lgaId ?? report.pollingUnit?.ward?.lgaId;
            const wardId = report.wardId ?? report.pollingUnit?.wardId ?? report.ward?.id;
            const puId = report.pollingUnitId ?? report.pollingUnit?.id;
            if (lgaId)
                bumpIncident(byLga, lgaId, weight, urgent, severity);
            if (wardId)
                bumpIncident(byWard, wardId, weight, urgent, severity);
            if (puId)
                bumpIncident(byPu, puId, weight, urgent, severity);
        }
        return { byLga, byWard, byPu };
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
        return (user.scopeType === shared_1.ScopeType.POLLING_UNIT || user.role === shared_1.CampaignRole.POLLING_AGENT);
    }
    isScopedToWard(user) {
        return (user.scopeType === shared_1.ScopeType.WARD || user.role === shared_1.CampaignRole.WARD_RA_OFFICER);
    }
    isScopedToLga(user) {
        return (user.scopeType === shared_1.ScopeType.LGA || user.role === shared_1.CampaignRole.LGA_COLLATION_OFFICER);
    }
};
exports.CollationBrowseService = CollationBrowseService;
exports.CollationBrowseService = CollationBrowseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollationBrowseService);
//# sourceMappingURL=collation-browse.service.js.map