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
exports.CollationService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const db_1 = require("@electromon/db");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const scope_resolver_service_1 = require("../../common/collation/scope-resolver.service");
const EDITABLE_STATUSES = new Set([
    shared_1.CollationResultStatus.DRAFT,
    shared_1.CollationResultStatus.REJECTED,
]);
let CollationService = class CollationService {
    prisma;
    scopeResolver;
    constructor(prisma, scopeResolver) {
        this.prisma = prisma;
        this.scopeResolver = scopeResolver;
    }
    async getDashboard(user) {
        if (!user.role || !user.campaignId) {
            throw new common_1.ForbiddenException('No active campaign membership');
        }
        const dashboard = await this.scopeResolver.buildDashboard(user.role, user.scopeType, user.scopeId);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        const pendingApprovals = level
            ? await this.countPendingApprovals(user.campaignId, level, user.scopeType, user.scopeId)
            : 0;
        const myResult = level
            ? await this.prisma.collationResult.findFirst({
                where: {
                    campaignId: user.campaignId,
                    level,
                    scopeType: user.scopeType,
                    scopeId: user.scopeId ?? '',
                },
            })
            : null;
        return {
            dashboard,
            scopeChain: user.scopeType && user.scopeId
                ? await this.scopeResolver.resolveScopeChain(user.scopeType, user.scopeId)
                : null,
            pendingApprovals,
            myResult,
        };
    }
    async listResults(user, status) {
        this.assertCollationUser(user);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        const where = {
            campaignId: user.campaignId,
            level,
            scopeType: user.scopeType,
            scopeId: user.scopeId,
        };
        if (status)
            where.status = status;
        return this.prisma.collationResult.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
    async listPendingApprovals(user) {
        this.assertCollationUser(user);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        const subordinateLevel = (0, shared_1.getParentLevel)(level);
        if (!subordinateLevel) {
            return [];
        }
        const childScopeIds = await this.getChildScopeIds(user.scopeType, user.scopeId, subordinateLevel);
        return this.enrichPuResults(await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: subordinateLevel,
                status: shared_1.CollationResultStatus.SUBMITTED,
                scopeId: { in: childScopeIds },
            },
            orderBy: { submittedAt: 'asc' },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        }));
    }
    async listWardPuSubmissions(user, options = {}) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.WARD || !user.scopeId) {
            throw new common_1.ForbiddenException('This endpoint is for ward-scoped officers');
        }
        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(50, Math.max(1, options.limit ?? 10));
        const search = options.search?.trim();
        const puWhere = {
            wardId: user.scopeId,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                        { code: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                    ],
                }
                : {}),
        };
        const matchingPus = await this.prisma.pollingUnit.findMany({
            where: puWhere,
            select: { id: true },
        });
        const puIds = matchingPus.map((pu) => pu.id);
        const visibleStatuses = [
            shared_1.CollationResultStatus.SUBMITTED,
            shared_1.CollationResultStatus.APPROVED,
            shared_1.CollationResultStatus.REJECTED,
        ];
        const baseWhere = {
            campaignId: user.campaignId,
            level: shared_1.CollationLevel.POLLING_UNIT,
            scopeId: { in: puIds },
        };
        const where = {
            ...baseWhere,
            status: options.status ?? { in: visibleStatuses },
        };
        if (puIds.length === 0) {
            return {
                data: [],
                meta: { page, limit, total: 0, totalPages: 0 },
                statusCounts: { submitted: 0, approved: 0, rejected: 0 },
            };
        }
        const [total, results, submitted, approved, rejected] = await Promise.all([
            this.prisma.collationResult.count({ where }),
            this.prisma.collationResult.findMany({
                where,
                orderBy: [{ submittedAt: { sort: 'desc', nulls: 'last' } }, { updatedAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                    approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            }),
            this.prisma.collationResult.count({
                where: { ...baseWhere, status: shared_1.CollationResultStatus.SUBMITTED },
            }),
            this.prisma.collationResult.count({
                where: { ...baseWhere, status: shared_1.CollationResultStatus.APPROVED },
            }),
            this.prisma.collationResult.count({
                where: { ...baseWhere, status: shared_1.CollationResultStatus.REJECTED },
            }),
        ]);
        return {
            data: await this.enrichPuResults(results),
            meta: {
                page,
                limit,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limit),
            },
            statusCounts: { submitted, approved, rejected },
        };
    }
    async listLgaWardSubmissions(user) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.LGA || !user.scopeId) {
            throw new common_1.ForbiddenException('This endpoint is for LGA-scoped collation officers');
        }
        const wardIds = await this.getChildScopeIds(shared_1.ScopeType.LGA, user.scopeId, shared_1.CollationLevel.WARD);
        return this.enrichWardResults(await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.WARD,
                scopeId: { in: wardIds },
                status: {
                    in: [
                        shared_1.CollationResultStatus.SUBMITTED,
                        shared_1.CollationResultStatus.APPROVED,
                        shared_1.CollationResultStatus.REJECTED,
                    ],
                },
            },
            orderBy: { submittedAt: 'desc' },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        }));
    }
    async listLgaWardPuResults(user, wardId) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.LGA || !user.scopeId) {
            throw new common_1.ForbiddenException('This endpoint is for LGA-scoped collation officers');
        }
        const ward = await this.prisma.ward.findFirst({
            where: { id: wardId, lgaId: user.scopeId },
            select: { id: true },
        });
        if (!ward) {
            throw new common_1.ForbiddenException('This ward is outside your LGA');
        }
        const puIds = await this.getChildScopeIds(shared_1.ScopeType.WARD, wardId, shared_1.CollationLevel.POLLING_UNIT);
        return this.enrichPuResults(await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeId: { in: puIds },
                status: {
                    in: [
                        shared_1.CollationResultStatus.SUBMITTED,
                        shared_1.CollationResultStatus.APPROVED,
                        shared_1.CollationResultStatus.REJECTED,
                    ],
                },
            },
            orderBy: { submittedAt: 'desc' },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        }));
    }
    async getLgaPuResult(user, puId) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.LGA || !user.scopeId) {
            throw new common_1.ForbiddenException('This endpoint is for LGA-scoped collation officers');
        }
        const unit = await this.prisma.pollingUnit.findFirst({
            where: { id: puId, ward: { lgaId: user.scopeId } },
            select: { id: true },
        });
        if (!unit) {
            throw new common_1.ForbiddenException('This polling unit is outside your LGA');
        }
        const result = await this.prisma.collationResult.findFirst({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeId: puId,
            },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
        if (!result)
            return null;
        const enriched = await this.enrichPuResults([result]);
        return enriched[0] ?? null;
    }
    async approveAllLgaWardResults(user, dto = {}) {
        this.assertCollationUser(user);
        if (user.role !== shared_1.CampaignRole.LGA_COLLATION_OFFICER) {
            throw new common_1.ForbiddenException('Only the LGA collation officer can approve ward results');
        }
        if (user.scopeType !== shared_1.ScopeType.LGA || !user.scopeId) {
            throw new common_1.ForbiddenException('LGA scope required');
        }
        const wardIds = await this.getChildScopeIds(shared_1.ScopeType.LGA, user.scopeId, shared_1.CollationLevel.WARD);
        const pending = await this.prisma.collationResult.findMany({
            where: {
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.WARD,
                scopeId: { in: wardIds },
                status: shared_1.CollationResultStatus.SUBMITTED,
            },
        });
        if (pending.length === 0) {
            throw new common_1.BadRequestException('No ward results are awaiting approval');
        }
        const approvedAt = new Date();
        await this.prisma.collationResult.updateMany({
            where: { id: { in: pending.map((r) => r.id) } },
            data: {
                status: shared_1.CollationResultStatus.APPROVED,
                approvedById: user.sub,
                approvedAt,
                approvalComment: dto.comment ?? null,
            },
        });
        await this.rollupToParent(user.campaignId, shared_1.CollationLevel.LGA, shared_1.ScopeType.LGA, user.scopeId, user.sub);
        return {
            approvedCount: pending.length,
            wardIds: pending.map((r) => r.scopeId),
        };
    }
    async enrichWardResults(results) {
        if (results.length === 0)
            return [];
        const wardIds = results
            .filter((r) => r.level === shared_1.CollationLevel.WARD)
            .map((r) => r.scopeId);
        const wards = wardIds.length
            ? await this.prisma.ward.findMany({
                where: { id: { in: wardIds } },
                select: { id: true, name: true, registrationAreaCode: true, lgaId: true },
            })
            : [];
        const wardMap = new Map(wards.map((w) => [w.id, w]));
        return results.map((result) => ({
            ...result,
            ward: wardMap.get(result.scopeId) ?? null,
        }));
    }
    async enrichPuResults(results) {
        if (results.length === 0)
            return [];
        const puIds = results
            .filter((r) => r.level === shared_1.CollationLevel.POLLING_UNIT)
            .map((r) => r.scopeId);
        const units = puIds.length
            ? await this.prisma.pollingUnit.findMany({
                where: { id: { in: puIds } },
                select: { id: true, code: true, name: true, wardId: true },
            })
            : [];
        const unitMap = new Map(units.map((u) => [u.id, u]));
        return results.map((result) => ({
            ...result,
            pollingUnit: unitMap.get(result.scopeId) ?? null,
        }));
    }
    async upsertResult(user, dto) {
        this.assertCollationUser(user);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        if (level === shared_1.CollationLevel.WARD) {
            throw new common_1.ForbiddenException('Ward officers review and approve PU results. Ward totals are rolled up automatically.');
        }
        const existing = await this.prisma.collationResult.findUnique({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId: user.campaignId,
                    level,
                    scopeType: user.scopeType,
                    scopeId: user.scopeId,
                },
            },
        });
        if (existing && !EDITABLE_STATUSES.has(existing.status)) {
            throw new common_1.BadRequestException('This result has already been submitted. Wait for approval or a return for correction.');
        }
        const ec8aPhotoUrls = dto.ec8aPhotoUrls !== undefined
            ? dto.ec8aPhotoUrls
            : existing?.ec8aPhotoUrls ?? [];
        const result = await this.prisma.collationResult.upsert({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId: user.campaignId,
                    level,
                    scopeType: user.scopeType,
                    scopeId: user.scopeId,
                },
            },
            create: {
                campaignId: user.campaignId,
                level,
                scopeType: user.scopeType,
                scopeId: user.scopeId,
                registeredVoters: dto.registeredVoters,
                accreditedVoters: dto.accreditedVoters,
                votesCast: dto.votesCast,
                partyResults: dto.partyResults,
                ec8aPhotoUrls,
                status: shared_1.CollationResultStatus.DRAFT,
            },
            update: {
                registeredVoters: dto.registeredVoters,
                accreditedVoters: dto.accreditedVoters,
                votesCast: dto.votesCast,
                partyResults: dto.partyResults,
                ec8aPhotoUrls,
                status: shared_1.CollationResultStatus.DRAFT,
                rejectionReason: null,
            },
        });
        return result;
    }
    async attachEc8aPhoto(user, id, photoUrl) {
        this.assertCollationUser(user);
        const result = await this.getOwnedResult(user, id);
        if (!EDITABLE_STATUSES.has(result.status)) {
            throw new common_1.BadRequestException('EC8A can only be uploaded while the result is a draft or returned for correction');
        }
        const ec8aPhotoUrls = [...(result.ec8aPhotoUrls ?? []), photoUrl];
        return this.prisma.collationResult.update({
            where: { id },
            data: { ec8aPhotoUrls },
        });
    }
    async submitResult(user, id) {
        this.assertCollationUser(user);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        if (level === shared_1.CollationLevel.WARD) {
            throw new common_1.ForbiddenException('Ward results are forwarded to the LGA automatically when PU results are approved.');
        }
        const result = await this.getOwnedResult(user, id);
        if (result.status === shared_1.CollationResultStatus.APPROVED) {
            throw new common_1.BadRequestException('Result is already approved');
        }
        if (result.status === shared_1.CollationResultStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Result is already submitted and awaiting approval');
        }
        if (!EDITABLE_STATUSES.has(result.status)) {
            throw new common_1.BadRequestException('Only draft or returned results can be submitted');
        }
        if (result.level === shared_1.CollationLevel.POLLING_UNIT &&
            (!result.ec8aPhotoUrls || result.ec8aPhotoUrls.length === 0)) {
            throw new common_1.BadRequestException('EC8A form must be uploaded before submission. Save figures as draft until the form is attached.');
        }
        return this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.SUBMITTED,
                submittedById: user.sub,
                submittedAt: new Date(),
                rejectionReason: null,
            },
        });
    }
    async approveResult(user, id, dto = {}) {
        this.assertCollationUser(user);
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        const subordinateLevel = (0, shared_1.getParentLevel)(level);
        if (!subordinateLevel) {
            throw new common_1.BadRequestException('This level cannot approve subordinate results');
        }
        const result = await this.prisma.collationResult.findUniqueOrThrow({ where: { id } });
        if (result.status !== shared_1.CollationResultStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only submitted results can be approved');
        }
        if (result.level !== subordinateLevel) {
            throw new common_1.ForbiddenException('You can only approve results from the level below yours');
        }
        await this.verifyApproverScope(user, result);
        const approved = await this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.APPROVED,
                approvedById: user.sub,
                approvedAt: new Date(),
                approvalComment: dto.comment ?? null,
            },
        });
        await this.rollupToParent(user.campaignId, level, user.scopeType, user.scopeId, user.sub);
        return approved;
    }
    async rejectResult(user, id, dto) {
        this.assertCollationUser(user);
        const result = await this.prisma.collationResult.findUniqueOrThrow({ where: { id } });
        if (result.status !== shared_1.CollationResultStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only submitted results can be rejected');
        }
        await this.verifyApproverScope(user, result);
        return this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.REJECTED,
                rejectionReason: dto.reason,
                approvedById: user.sub,
                approvedAt: new Date(),
            },
        });
    }
    assertCollationUser(user) {
        if (!user.campaignId || !user.role || !user.scopeType || !user.scopeId) {
            throw new common_1.ForbiddenException('Collation access requires scoped campaign membership');
        }
        if (!(0, shared_1.getCollationLevelForRole)(user.role)) {
            throw new common_1.ForbiddenException('Your role is not assigned to a collation level');
        }
    }
    async getOwnedResult(user, id) {
        const result = await this.prisma.collationResult.findUnique({ where: { id } });
        if (!result)
            throw new common_1.NotFoundException('Collation result not found');
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        if (result.campaignId !== user.campaignId ||
            result.level !== level ||
            result.scopeType !== user.scopeType ||
            result.scopeId !== user.scopeId) {
            throw new common_1.ForbiddenException('You can only manage results for your assigned scope');
        }
        return result;
    }
    async verifyApproverScope(user, result) {
        const userLevel = (0, shared_1.getCollationLevelForRole)(user.role);
        const subordinateLevel = (0, shared_1.getParentLevel)(userLevel);
        if (!subordinateLevel || result.level !== subordinateLevel) {
            throw new common_1.ForbiddenException('You cannot approve results at this level');
        }
        const childScopeIds = await this.getChildScopeIds(user.scopeType, user.scopeId, subordinateLevel);
        if (!childScopeIds.includes(result.scopeId)) {
            throw new common_1.ForbiddenException('Result is outside your approval scope');
        }
    }
    async countPendingApprovals(campaignId, level, scopeType, scopeId) {
        const subordinateLevel = (0, shared_1.getParentLevel)(level);
        if (!subordinateLevel || !scopeId)
            return 0;
        const childScopeIds = await this.getChildScopeIds(scopeType, scopeId, subordinateLevel);
        return this.prisma.collationResult.count({
            where: {
                campaignId,
                level: subordinateLevel,
                status: shared_1.CollationResultStatus.SUBMITTED,
                scopeId: { in: childScopeIds },
            },
        });
    }
    async getChildScopeIds(scopeType, scopeId, childLevel) {
        switch (childLevel) {
            case shared_1.CollationLevel.POLLING_UNIT: {
                if (scopeType !== shared_1.ScopeType.WARD)
                    return [];
                const pus = await this.prisma.pollingUnit.findMany({ where: { wardId: scopeId }, select: { id: true } });
                return pus.map((p) => p.id);
            }
            case shared_1.CollationLevel.WARD: {
                if (scopeType !== shared_1.ScopeType.LGA)
                    return [];
                const wards = await this.prisma.ward.findMany({ where: { lgaId: scopeId }, select: { id: true } });
                return wards.map((w) => w.id);
            }
            case shared_1.CollationLevel.LGA: {
                if (scopeType !== shared_1.ScopeType.STATE)
                    return [];
                const lgas = await this.prisma.lGA.findMany({ where: { stateId: scopeId }, select: { id: true } });
                return lgas.map((l) => l.id);
            }
            case shared_1.CollationLevel.STATE: {
                if (scopeType !== shared_1.ScopeType.NATIONAL)
                    return [];
                const states = await this.prisma.state.findMany({ select: { id: true } });
                return states.map((s) => s.id);
            }
            default:
                return [];
        }
    }
    aggregatePartyResults(children) {
        const totals = {};
        for (const child of children) {
            const partyResults = child.partyResults;
            if (!partyResults)
                continue;
            for (const [party, votes] of Object.entries(partyResults)) {
                totals[party] = (totals[party] ?? 0) + (votes ?? 0);
            }
        }
        return totals;
    }
    async rollupToParent(campaignId, level, scopeType, scopeId, submittedById) {
        const subordinateLevel = (0, shared_1.getParentLevel)(level);
        if (!subordinateLevel)
            return;
        const childScopeIds = await this.getChildScopeIds(scopeType, scopeId, subordinateLevel);
        const approvedChildren = await this.prisma.collationResult.findMany({
            where: {
                campaignId,
                level: subordinateLevel,
                scopeId: { in: childScopeIds },
                status: shared_1.CollationResultStatus.APPROVED,
            },
        });
        if (approvedChildren.length === 0)
            return;
        const totals = approvedChildren.reduce((acc, r) => ({
            registeredVoters: (acc.registeredVoters ?? 0) + (r.registeredVoters ?? 0),
            accreditedVoters: (acc.accreditedVoters ?? 0) + (r.accreditedVoters ?? 0),
            votesCast: (acc.votesCast ?? 0) + (r.votesCast ?? 0),
        }), { registeredVoters: 0, accreditedVoters: 0, votesCast: 0 });
        const partyResults = this.aggregatePartyResults(approvedChildren);
        const autoSubmitUpstream = level === shared_1.CollationLevel.WARD || level === shared_1.CollationLevel.LGA;
        const status = autoSubmitUpstream
            ? shared_1.CollationResultStatus.SUBMITTED
            : shared_1.CollationResultStatus.DRAFT;
        await this.prisma.collationResult.upsert({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId,
                    level,
                    scopeType,
                    scopeId,
                },
            },
            create: {
                campaignId,
                level,
                scopeType,
                scopeId,
                ...totals,
                partyResults,
                status,
                submittedById: autoSubmitUpstream ? submittedById : undefined,
                submittedAt: autoSubmitUpstream ? new Date() : undefined,
            },
            update: {
                ...totals,
                partyResults,
                status,
                submittedById: autoSubmitUpstream ? submittedById : undefined,
                submittedAt: autoSubmitUpstream ? new Date() : undefined,
                rejectionReason: null,
            },
        });
    }
};
exports.CollationService = CollationService;
exports.CollationService = CollationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scope_resolver_service_1.ScopeResolverService])
], CollationService);
//# sourceMappingURL=collation.service.js.map