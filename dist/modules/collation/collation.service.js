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
        const statusFilter = options.status;
        const allPus = await this.prisma.pollingUnit.findMany({
            where: {
                wardId: user.scopeId,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                            { code: { contains: search, mode: db_1.Prisma.QueryMode.insensitive } },
                        ],
                    }
                    : {}),
            },
            select: { id: true, code: true, name: true, wardId: true },
            orderBy: { code: 'asc' },
        });
        const allPuIds = allPus.map((pu) => pu.id);
        const wardAllPus = search
            ? await this.prisma.pollingUnit.findMany({
                where: { wardId: user.scopeId },
                select: { id: true },
            })
            : allPus;
        const wardPuIds = wardAllPus.map((pu) => pu.id);
        const totalPus = wardPuIds.length;
        const emptyCounts = {
            submitted: 0,
            approved: 0,
            rejected: 0,
            draft: 0,
            notStarted: 0,
            totalPus,
        };
        if (wardPuIds.length === 0 && allPuIds.length === 0) {
            return {
                data: [],
                meta: { page, limit, total: 0, totalPages: 0 },
                statusCounts: emptyCounts,
                wardMeta: {
                    returnedByLga: false,
                    canReturnApprovedPus: false,
                    canResubmitToLga: false,
                    rejectionReason: null,
                },
            };
        }
        const [wardResults, listResults] = await Promise.all([
            this.prisma.collationResult.findMany({
                where: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.POLLING_UNIT,
                    scopeId: { in: wardPuIds },
                },
                select: { scopeId: true, status: true },
            }),
            allPuIds.length === 0
                ? Promise.resolve([])
                : this.prisma.collationResult.findMany({
                    where: {
                        campaignId: user.campaignId,
                        level: shared_1.CollationLevel.POLLING_UNIT,
                        scopeId: { in: allPuIds },
                    },
                    include: {
                        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                    },
                }),
        ]);
        const countByStatus = (rows) => {
            let submitted = 0;
            let approved = 0;
            let rejected = 0;
            let draft = 0;
            for (const row of rows) {
                if (row.status === 'SUBMITTED')
                    submitted += 1;
                else if (row.status === 'APPROVED')
                    approved += 1;
                else if (row.status === 'REJECTED')
                    rejected += 1;
                else if (row.status === 'DRAFT')
                    draft += 1;
            }
            const notStarted = Math.max(0, totalPus - submitted - approved - rejected - draft);
            return { submitted, approved, rejected, draft, notStarted, totalPus };
        };
        const statusCounts = countByStatus(wardResults);
        const resultByPu = new Map(listResults.map((r) => [r.scopeId, r]));
        const rows = [];
        for (const pu of allPus) {
            const result = resultByPu.get(pu.id) ?? null;
            const status = result
                ? result.status
                : 'NOT_STARTED';
            if (statusFilter && status !== statusFilter)
                continue;
            rows.push({ status, result, pollingUnit: pu });
        }
        const statusOrder = {
            SUBMITTED: 0,
            REJECTED: 1,
            DRAFT: 2,
            NOT_STARTED: 3,
            APPROVED: 4,
        };
        rows.sort((a, b) => {
            const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
            if (orderDiff !== 0)
                return orderDiff;
            return a.pollingUnit.code.localeCompare(b.pollingUnit.code);
        });
        const total = rows.length;
        const pageRows = rows.slice((page - 1) * limit, page * limit);
        const data = pageRows.map(({ status, result, pollingUnit }) => {
            if (result) {
                return { ...result, pollingUnit };
            }
            return {
                id: `not-started:${pollingUnit.id}`,
                campaignId: user.campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeType: shared_1.ScopeType.POLLING_UNIT,
                scopeId: pollingUnit.id,
                registeredVoters: null,
                accreditedVoters: null,
                votesCast: null,
                partyResults: null,
                ec8aPhotoUrls: [],
                approvalComment: null,
                status: 'NOT_STARTED',
                submittedById: null,
                submittedAt: null,
                approvedById: null,
                approvedAt: null,
                rejectionReason: null,
                parentResultId: null,
                createdAt: null,
                updatedAt: null,
                submittedBy: null,
                approvedBy: null,
                pollingUnit,
            };
        });
        const wardResult = await this.prisma.collationResult.findUnique({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.WARD,
                    scopeType: shared_1.ScopeType.WARD,
                    scopeId: user.scopeId,
                },
            },
            select: { status: true, rejectionReason: true },
        });
        const returnedByLga = wardResult?.status === shared_1.CollationResultStatus.REJECTED;
        const allPusApproved = statusCounts.totalPus > 0 && statusCounts.approved === statusCounts.totalPus;
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limit),
            },
            statusCounts,
            wardMeta: {
                returnedByLga,
                canReturnApprovedPus: returnedByLga,
                canResubmitToLga: returnedByLga && allPusApproved,
                rejectionReason: wardResult?.rejectionReason ?? null,
            },
        };
    }
    async listLgaWardSubmissions(user) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.LGA || !user.scopeId) {
            throw new common_1.ForbiddenException('This endpoint is for LGA-scoped collation officers');
        }
        const wardIds = await this.getChildScopeIds(shared_1.ScopeType.LGA, user.scopeId, shared_1.CollationLevel.WARD);
        const results = await this.enrichWardResults(await this.prisma.collationResult.findMany({
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
        const readinessByWard = await this.getWardPuReadinessMap(user.campaignId, wardIds);
        return results.map((result) => ({
            ...result,
            puReadiness: readinessByWard.get(result.scopeId) ?? {
                totalPus: 0,
                approvedPus: 0,
                submittedPus: 0,
                rejectedPus: 0,
                missingPus: 0,
                readyForLgaApproval: false,
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
        for (const result of pending) {
            await this.assertAllPollingUnitsApprovedInWard(user.campaignId, result.scopeId);
        }
        const approvedAt = new Date();
        await this.prisma.$transaction([
            this.prisma.collationResult.updateMany({
                where: { id: { in: pending.map((r) => r.id) } },
                data: {
                    status: shared_1.CollationResultStatus.APPROVED,
                    approvedById: user.sub,
                    approvedAt,
                    approvalComment: dto.comment ?? null,
                },
            }),
            this.prisma.collationActionLog.createMany({
                data: pending.map((result) => ({
                    campaignId: result.campaignId,
                    collationResultId: result.id,
                    action: 'APPROVED',
                    actorId: user.sub,
                    fromStatus: shared_1.CollationResultStatus.SUBMITTED,
                    toStatus: shared_1.CollationResultStatus.APPROVED,
                    comment: dto.comment ?? null,
                    metadata: {
                        bulk: true,
                        level: result.level,
                        scopeType: result.scopeType,
                        scopeId: result.scopeId,
                    },
                })),
            }),
        ]);
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
        const fromStatus = result.status;
        const submitted = await this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.SUBMITTED,
                submittedById: user.sub,
                submittedAt: new Date(),
                rejectionReason: null,
            },
        });
        await this.writeActionLog({
            campaignId: submitted.campaignId,
            collationResultId: submitted.id,
            action: 'SUBMITTED',
            actorId: user.sub,
            fromStatus,
            toStatus: shared_1.CollationResultStatus.SUBMITTED,
            metadata: {
                level: submitted.level,
                scopeType: submitted.scopeType,
                scopeId: submitted.scopeId,
            },
        });
        return submitted;
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
        if (result.level === shared_1.CollationLevel.WARD) {
            await this.assertAllPollingUnitsApprovedInWard(user.campaignId, result.scopeId);
        }
        const approved = await this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.APPROVED,
                approvedById: user.sub,
                approvedAt: new Date(),
                approvalComment: dto.comment ?? null,
            },
        });
        await this.writeActionLog({
            campaignId: approved.campaignId,
            collationResultId: approved.id,
            action: 'APPROVED',
            actorId: user.sub,
            fromStatus: shared_1.CollationResultStatus.SUBMITTED,
            toStatus: shared_1.CollationResultStatus.APPROVED,
            comment: dto.comment ?? null,
            metadata: {
                level: approved.level,
                scopeType: approved.scopeType,
                scopeId: approved.scopeId,
            },
        });
        await this.rollupToParent(user.campaignId, level, user.scopeType, user.scopeId, user.sub);
        return approved;
    }
    async rejectResult(user, id, dto) {
        this.assertCollationUser(user);
        const result = await this.prisma.collationResult.findUniqueOrThrow({ where: { id } });
        const fromStatus = result.status;
        const isSubmitted = fromStatus === shared_1.CollationResultStatus.SUBMITTED;
        const canReturnApprovedAfterLga = fromStatus === shared_1.CollationResultStatus.APPROVED &&
            result.level === shared_1.CollationLevel.POLLING_UNIT &&
            (await this.isWardReturnedByLga(result.campaignId, result.scopeId));
        if (!isSubmitted && !canReturnApprovedAfterLga) {
            if (fromStatus === shared_1.CollationResultStatus.APPROVED) {
                throw new common_1.BadRequestException('Approved PUs can only be returned after LGA has returned your ward rollup for correction');
            }
            throw new common_1.BadRequestException('Only submitted results can be rejected');
        }
        await this.verifyApproverScope(user, result);
        const rejected = await this.prisma.collationResult.update({
            where: { id },
            data: {
                status: shared_1.CollationResultStatus.REJECTED,
                rejectionReason: dto.reason,
                approvedById: user.sub,
                approvedAt: new Date(),
                approvalComment: null,
            },
        });
        await this.writeActionLog({
            campaignId: rejected.campaignId,
            collationResultId: rejected.id,
            action: 'REJECTED',
            actorId: user.sub,
            fromStatus,
            toStatus: shared_1.CollationResultStatus.REJECTED,
            comment: dto.reason,
            metadata: {
                level: rejected.level,
                scopeType: rejected.scopeType,
                scopeId: rejected.scopeId,
                afterLgaReturn: canReturnApprovedAfterLga,
            },
        });
        if (canReturnApprovedAfterLga) {
            await this.rebuildWardRollupAfterPuChange(user.campaignId, user.scopeId, {
                keepRejected: true,
                rejectionReasonPreserved: true,
                submittedById: user.sub,
            });
        }
        return rejected;
    }
    async resubmitWardToLga(user) {
        this.assertCollationUser(user);
        if (user.scopeType !== shared_1.ScopeType.WARD || !user.scopeId) {
            throw new common_1.ForbiddenException('Only ward officers can resubmit a ward rollup to LGA');
        }
        const level = (0, shared_1.getCollationLevelForRole)(user.role);
        if (level !== shared_1.CollationLevel.WARD) {
            throw new common_1.ForbiddenException('Only ward officers can resubmit a ward rollup to LGA');
        }
        const wardResult = await this.prisma.collationResult.findUnique({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId: user.campaignId,
                    level: shared_1.CollationLevel.WARD,
                    scopeType: shared_1.ScopeType.WARD,
                    scopeId: user.scopeId,
                },
            },
        });
        if (!wardResult) {
            throw new common_1.BadRequestException('No ward rollup exists yet. Approve PU results first.');
        }
        if (wardResult.status !== shared_1.CollationResultStatus.REJECTED) {
            throw new common_1.BadRequestException('Ward rollup can only be re-submitted after LGA has returned it');
        }
        await this.assertAllPollingUnitsApprovedInWard(user.campaignId, user.scopeId);
        const updated = await this.rebuildWardRollupAfterPuChange(user.campaignId, user.scopeId, {
            forceSubmit: true,
            submittedById: user.sub,
            clearRejection: true,
        });
        if (updated) {
            await this.writeActionLog({
                campaignId: updated.campaignId,
                collationResultId: updated.id,
                action: 'SUBMITTED',
                actorId: user.sub,
                fromStatus: shared_1.CollationResultStatus.REJECTED,
                toStatus: shared_1.CollationResultStatus.SUBMITTED,
                comment: 'Re-submitted to LGA after reviewing ward totals',
                metadata: { level: updated.level, scopeType: updated.scopeType, scopeId: updated.scopeId },
            });
        }
        return updated;
    }
    async isWardReturnedByLga(campaignId, pollingUnitId) {
        const pu = await this.prisma.pollingUnit.findUnique({
            where: { id: pollingUnitId },
            select: { wardId: true },
        });
        if (!pu?.wardId)
            return false;
        const wardResult = await this.prisma.collationResult.findUnique({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId,
                    level: shared_1.CollationLevel.WARD,
                    scopeType: shared_1.ScopeType.WARD,
                    scopeId: pu.wardId,
                },
            },
            select: { status: true },
        });
        return wardResult?.status === shared_1.CollationResultStatus.REJECTED;
    }
    async rebuildWardRollupAfterPuChange(campaignId, wardId, options = {}) {
        const existing = await this.prisma.collationResult.findUnique({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId,
                    level: shared_1.CollationLevel.WARD,
                    scopeType: shared_1.ScopeType.WARD,
                    scopeId: wardId,
                },
            },
        });
        const puIds = await this.getChildScopeIds(shared_1.ScopeType.WARD, wardId, shared_1.CollationLevel.POLLING_UNIT);
        const approvedChildren = await this.prisma.collationResult.findMany({
            where: {
                campaignId,
                level: shared_1.CollationLevel.POLLING_UNIT,
                scopeId: { in: puIds },
                status: shared_1.CollationResultStatus.APPROVED,
            },
        });
        const totals = approvedChildren.reduce((acc, r) => ({
            registeredVoters: (acc.registeredVoters ?? 0) + (r.registeredVoters ?? 0),
            accreditedVoters: (acc.accreditedVoters ?? 0) + (r.accreditedVoters ?? 0),
            votesCast: (acc.votesCast ?? 0) + (r.votesCast ?? 0),
        }), { registeredVoters: 0, accreditedVoters: 0, votesCast: 0 });
        const partyResults = this.aggregatePartyResults(approvedChildren);
        let status;
        if (options.forceSubmit) {
            status = shared_1.CollationResultStatus.SUBMITTED;
        }
        else if (options.keepRejected || existing?.status === shared_1.CollationResultStatus.REJECTED) {
            status = shared_1.CollationResultStatus.REJECTED;
        }
        else {
            status = shared_1.CollationResultStatus.SUBMITTED;
        }
        const rejectionReason = options.clearRejection
            ? null
            : options.rejectionReasonPreserved
                ? (existing?.rejectionReason ?? null)
                : status === shared_1.CollationResultStatus.REJECTED
                    ? (existing?.rejectionReason ?? null)
                    : null;
        return this.prisma.collationResult.upsert({
            where: {
                campaignId_level_scopeType_scopeId: {
                    campaignId,
                    level: shared_1.CollationLevel.WARD,
                    scopeType: shared_1.ScopeType.WARD,
                    scopeId: wardId,
                },
            },
            create: {
                campaignId,
                level: shared_1.CollationLevel.WARD,
                scopeType: shared_1.ScopeType.WARD,
                scopeId: wardId,
                ...totals,
                partyResults,
                status,
                submittedById: options.submittedById,
                submittedAt: status === shared_1.CollationResultStatus.SUBMITTED ? new Date() : undefined,
                rejectionReason,
            },
            update: {
                ...totals,
                partyResults,
                status,
                submittedById: status === shared_1.CollationResultStatus.SUBMITTED
                    ? (options.submittedById ?? existing?.submittedById)
                    : existing?.submittedById,
                submittedAt: status === shared_1.CollationResultStatus.SUBMITTED ? new Date() : existing?.submittedAt,
                rejectionReason,
                approvalComment: status === shared_1.CollationResultStatus.SUBMITTED ? null : existing?.approvalComment,
                approvedById: status === shared_1.CollationResultStatus.SUBMITTED ? null : existing?.approvedById,
                approvedAt: status === shared_1.CollationResultStatus.SUBMITTED ? null : existing?.approvedAt,
            },
        });
    }
    async listActionLogs(user, resultId) {
        this.assertCollationUser(user);
        const result = await this.prisma.collationResult.findUnique({ where: { id: resultId } });
        if (!result)
            throw new common_1.NotFoundException('Collation result not found');
        if (result.campaignId !== user.campaignId) {
            throw new common_1.ForbiddenException('Result is outside your campaign');
        }
        const ownLevel = (0, shared_1.getCollationLevelForRole)(user.role);
        const canViewOwn = result.level === ownLevel &&
            result.scopeType === user.scopeType &&
            result.scopeId === user.scopeId;
        if (!canViewOwn) {
            await this.verifyApproverScope(user, result);
        }
        return this.prisma.collationActionLog.findMany({
            where: { collationResultId: resultId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
    async getWardPuReadinessMap(campaignId, wardIds) {
        const map = new Map();
        if (wardIds.length === 0)
            return map;
        const pus = await this.prisma.pollingUnit.findMany({
            where: { wardId: { in: wardIds } },
            select: { id: true, wardId: true },
        });
        const puIds = pus.map((pu) => pu.id);
        const results = puIds.length
            ? await this.prisma.collationResult.findMany({
                where: {
                    campaignId,
                    level: shared_1.CollationLevel.POLLING_UNIT,
                    scopeId: { in: puIds },
                },
                select: { scopeId: true, status: true },
            })
            : [];
        const resultByPu = new Map(results.map((r) => [r.scopeId, r.status]));
        const pusByWard = new Map();
        for (const pu of pus) {
            const list = pusByWard.get(pu.wardId) ?? [];
            list.push(pu.id);
            pusByWard.set(pu.wardId, list);
        }
        for (const wardId of wardIds) {
            const wardPuIds = pusByWard.get(wardId) ?? [];
            let approvedPus = 0;
            let submittedPus = 0;
            let rejectedPus = 0;
            let missingPus = 0;
            for (const puId of wardPuIds) {
                const status = resultByPu.get(puId);
                if (!status) {
                    missingPus += 1;
                    continue;
                }
                if (status === shared_1.CollationResultStatus.APPROVED)
                    approvedPus += 1;
                else if (status === shared_1.CollationResultStatus.SUBMITTED)
                    submittedPus += 1;
                else if (status === shared_1.CollationResultStatus.REJECTED)
                    rejectedPus += 1;
                else
                    missingPus += 1;
            }
            const totalPus = wardPuIds.length;
            map.set(wardId, {
                totalPus,
                approvedPus,
                submittedPus,
                rejectedPus,
                missingPus,
                readyForLgaApproval: totalPus > 0 && approvedPus === totalPus,
            });
        }
        return map;
    }
    async assertAllPollingUnitsApprovedInWard(campaignId, wardId) {
        const readiness = (await this.getWardPuReadinessMap(campaignId, [wardId])).get(wardId);
        if (!readiness) {
            throw new common_1.BadRequestException('Ward polling units could not be verified');
        }
        if (!readiness.readyForLgaApproval) {
            throw new common_1.BadRequestException(`Cannot approve this ward until every polling unit is approved. ` +
                `${readiness.approvedPus} of ${readiness.totalPus} PUs approved` +
                (readiness.submittedPus ? `, ${readiness.submittedPus} awaiting ward approval` : '') +
                (readiness.rejectedPus ? `, ${readiness.rejectedPus} returned` : '') +
                (readiness.missingPus ? `, ${readiness.missingPus} not yet submitted` : '') +
                '.');
        }
    }
    async writeActionLog(input) {
        return this.prisma.collationActionLog.create({
            data: {
                campaignId: input.campaignId,
                collationResultId: input.collationResultId,
                action: input.action,
                actorId: input.actorId,
                fromStatus: input.fromStatus ?? null,
                toStatus: input.toStatus,
                comment: input.comment ?? null,
                metadata: input.metadata ?? undefined,
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