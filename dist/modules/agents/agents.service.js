"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../common/prisma/prisma.service");
const campaign_scope_1 = require("../../common/scoping/campaign-scope");
const phone_util_1 = require("../auth/phone.util");
const agents_dto_1 = require("./dto/agents.dto");
let AgentsService = class AgentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertManager(user) {
        const allowed = new Set([
            shared_1.CampaignRole.CAMPAIGN_DIRECTOR,
            shared_1.CampaignRole.STATE_COLLATION_OFFICER,
            shared_1.CampaignRole.LGA_COLLATION_OFFICER,
        ]);
        if (!user.role || !allowed.has(user.role)) {
            throw new common_1.ForbiddenException('You cannot manage ward or PU agents');
        }
    }
    async assertCampaignAccess(userId, campaignId) {
        const membership = await this.prisma.campaignMembership.findFirst({
            where: { userId, campaignId, isActive: true },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this campaign');
        }
        return membership;
    }
    resolveManagedLgaId(user, requestedLgaId) {
        if ((0, campaign_scope_1.isLgaScopedUser)(user)) {
            const scopeId = (0, campaign_scope_1.getLgaScopeId)(user);
            if (!scopeId)
                throw new common_1.ForbiddenException('Your account is not assigned to an LGA');
            if (requestedLgaId && requestedLgaId !== scopeId) {
                throw new common_1.ForbiddenException('You can only manage agents in your assigned LGA');
            }
            return scopeId;
        }
        return requestedLgaId;
    }
    async requireManagedLgaId(user, requestedLgaId, role, scopeId) {
        const fromUser = this.resolveManagedLgaId(user, requestedLgaId);
        if (fromUser)
            return fromUser;
        if (this.isWardRole(role)) {
            const ward = await this.prisma.ward.findUnique({
                where: { id: scopeId },
                select: { lgaId: true },
            });
            if (!ward)
                throw new common_1.BadRequestException('Ward not found');
            return ward.lgaId;
        }
        const pu = await this.prisma.pollingUnit.findUnique({
            where: { id: scopeId },
            select: { ward: { select: { lgaId: true } } },
        });
        if (!pu)
            throw new common_1.BadRequestException('Polling unit not found');
        return pu.ward.lgaId;
    }
    isWardRole(role) {
        return role === agents_dto_1.WARD_AGENT_ROLE;
    }
    isPuRole(role) {
        return role === agents_dto_1.PU_AGENT_ROLE;
    }
    assertManageableRole(role) {
        if (!agents_dto_1.MANAGEABLE_AGENT_ROLES.includes(role)) {
            throw new common_1.BadRequestException('Role cannot be assigned via agent management');
        }
    }
    async resolveScopeInLga(role, scopeId, lgaId) {
        if (this.isWardRole(role)) {
            const ward = await this.prisma.ward.findFirst({
                where: { id: scopeId, lgaId },
                include: { lga: { select: { id: true, name: true } } },
            });
            if (!ward) {
                throw new common_1.BadRequestException('Ward not found in this LGA');
            }
            return {
                scopeType: shared_1.ScopeType.WARD,
                scopeId: ward.id,
                scopeName: ward.name,
                wardName: ward.name,
                lgaName: ward.lga.name,
            };
        }
        const pu = await this.prisma.pollingUnit.findFirst({
            where: { id: scopeId, ward: { lgaId } },
            include: {
                ward: { include: { lga: { select: { id: true, name: true } } } },
            },
        });
        if (!pu) {
            throw new common_1.BadRequestException('Polling unit not found in this LGA');
        }
        return {
            scopeType: shared_1.ScopeType.POLLING_UNIT,
            scopeId: pu.id,
            scopeName: `${pu.name} (${pu.code})`,
            wardName: pu.ward.name,
            lgaName: pu.ward.lga.name,
        };
    }
    mapAgent(m, meta) {
        return {
            membershipId: m.id,
            userId: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            phoneNumber: m.user.phoneNumber,
            email: m.user.email,
            role: m.role,
            scopeType: m.scopeType,
            scopeId: m.scopeId,
            scopeName: meta.scopeName,
            wardName: meta.wardName ?? null,
            lgaName: meta.lgaName ?? null,
            isActive: m.isActive,
            userActive: m.user.isActive,
            createdAt: m.createdAt,
        };
    }
    async enrichMemberships(memberships) {
        const wardIds = memberships
            .filter((m) => m.scopeType === shared_1.ScopeType.WARD && m.scopeId)
            .map((m) => m.scopeId);
        const puIds = memberships
            .filter((m) => m.scopeType === shared_1.ScopeType.POLLING_UNIT && m.scopeId)
            .map((m) => m.scopeId);
        const [wards, units] = await Promise.all([
            wardIds.length
                ? this.prisma.ward.findMany({
                    where: { id: { in: wardIds } },
                    include: { lga: { select: { name: true } } },
                })
                : Promise.resolve([]),
            puIds.length
                ? this.prisma.pollingUnit.findMany({
                    where: { id: { in: puIds } },
                    include: { ward: { include: { lga: { select: { name: true } } } } },
                })
                : Promise.resolve([]),
        ]);
        const wardMap = new Map(wards.map((w) => [w.id, w]));
        const puMap = new Map(units.map((u) => [u.id, u]));
        return memberships.map((m) => {
            if (m.scopeType === shared_1.ScopeType.WARD && m.scopeId) {
                const ward = wardMap.get(m.scopeId);
                return this.mapAgent(m, {
                    scopeName: ward?.name ?? m.scopeId,
                    wardName: ward?.name,
                    lgaName: ward?.lga.name,
                });
            }
            if (m.scopeType === shared_1.ScopeType.POLLING_UNIT && m.scopeId) {
                const pu = puMap.get(m.scopeId);
                return this.mapAgent(m, {
                    scopeName: pu ? `${pu.name} (${pu.code})` : m.scopeId,
                    wardName: pu?.ward.name,
                    lgaName: pu?.ward.lga.name,
                });
            }
            return this.mapAgent(m, { scopeName: m.scopeId ?? '—' });
        });
    }
    async listOptions(user, campaignId, lgaId) {
        this.assertManager(user);
        await this.assertCampaignAccess(user.sub, campaignId);
        const managedLgaId = this.resolveManagedLgaId(user, lgaId);
        if (!managedLgaId) {
            throw new common_1.BadRequestException('lgaId is required');
        }
        const lga = await this.prisma.lGA.findUnique({
            where: { id: managedLgaId },
            select: { id: true, name: true },
        });
        if (!lga)
            throw new common_1.NotFoundException('LGA not found');
        const wards = await this.prisma.ward.findMany({
            where: { lgaId: managedLgaId },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                registrationAreaCode: true,
                pollingUnits: {
                    orderBy: { code: 'asc' },
                    select: { id: true, code: true, name: true },
                },
            },
        });
        return {
            lga,
            wards: wards.map((w) => ({
                id: w.id,
                name: w.name,
                registrationAreaCode: w.registrationAreaCode,
                pollingUnits: w.pollingUnits,
            })),
        };
    }
    async list(user, query) {
        this.assertManager(user);
        await this.assertCampaignAccess(user.sub, query.campaignId);
        const managedLgaId = this.resolveManagedLgaId(user, query.lgaId);
        if (!managedLgaId) {
            throw new common_1.BadRequestException('lgaId is required');
        }
        const kind = query.kind ?? 'all';
        const roleFilter = kind === 'ward'
            ? [agents_dto_1.WARD_AGENT_ROLE]
            : kind === 'pu'
                ? [agents_dto_1.PU_AGENT_ROLE]
                : [...agents_dto_1.MANAGEABLE_AGENT_ROLES];
        const wardIds = (await this.prisma.ward.findMany({
            where: { lgaId: managedLgaId, ...(query.wardId ? { id: query.wardId } : {}) },
            select: { id: true },
        })).map((w) => w.id);
        const puIds = (await this.prisma.pollingUnit.findMany({
            where: {
                ward: {
                    lgaId: managedLgaId,
                    ...(query.wardId ? { id: query.wardId } : {}),
                },
            },
            select: { id: true },
        })).map((p) => p.id);
        const scopeOr = [];
        if (kind !== 'pu' && wardIds.length) {
            scopeOr.push({ scopeType: shared_1.ScopeType.WARD, scopeId: { in: wardIds } });
        }
        if (kind !== 'ward' && puIds.length) {
            scopeOr.push({ scopeType: shared_1.ScopeType.POLLING_UNIT, scopeId: { in: puIds } });
        }
        if (!scopeOr.length) {
            return [];
        }
        const search = query.search?.trim();
        const memberships = await this.prisma.campaignMembership.findMany({
            where: {
                campaignId: query.campaignId,
                role: { in: roleFilter },
                OR: scopeOr,
                ...(query.includeInactive ? {} : { isActive: true }),
                ...(search
                    ? {
                        user: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' } },
                                { lastName: { contains: search, mode: 'insensitive' } },
                                { phoneNumber: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    }
                    : {}),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
            orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
            take: 500,
        });
        return this.enrichMemberships(memberships);
    }
    async listActivities(user, membershipId) {
        this.assertManager(user);
        const membership = await this.prisma.campaignMembership.findUnique({
            where: { id: membershipId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!membership)
            throw new common_1.NotFoundException('Agent not found');
        await this.assertCampaignAccess(user.sub, membership.campaignId);
        this.assertManageableRole(membership.role);
        const managedLgaId = await this.requireManagedLgaId(user, undefined, membership.role, membership.scopeId);
        await this.resolveScopeInLga(membership.role, membership.scopeId, managedLgaId);
        const userId = membership.userId;
        const campaignId = membership.campaignId;
        const [collationLogs, reportedIncidents, handledIncidents] = await Promise.all([
            this.prisma.collationActionLog.findMany({
                where: { actorId: userId, campaignId },
                include: {
                    collationResult: {
                        select: {
                            id: true,
                            level: true,
                            scopeType: true,
                            scopeId: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 80,
            }),
            this.prisma.fieldReport.findMany({
                where: { reportedById: userId, campaignId },
                include: {
                    pollingUnit: { select: { code: true, name: true } },
                    ward: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 80,
            }),
            this.prisma.fieldReport.findMany({
                where: { handledById: userId, campaignId, NOT: { reportedById: userId } },
                include: {
                    pollingUnit: { select: { code: true, name: true } },
                    ward: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 80,
            }),
        ]);
        const scopeIds = [
            ...new Set(collationLogs
                .map((l) => l.collationResult?.scopeId)
                .filter((id) => Boolean(id))),
        ];
        const [wards, units] = await Promise.all([
            this.prisma.ward.findMany({
                where: { id: { in: scopeIds } },
                select: { id: true, name: true },
            }),
            this.prisma.pollingUnit.findMany({
                where: { id: { in: scopeIds } },
                select: { id: true, code: true, name: true },
            }),
        ]);
        const wardName = new Map(wards.map((w) => [w.id, w.name]));
        const puName = new Map(units.map((u) => [u.id, `${u.name} (${u.code})`]));
        const collationActionLabel = {
            SUBMITTED: 'Submitted result',
            APPROVED: 'Approved result',
            REJECTED: 'Returned result',
        };
        const activities = [];
        for (const log of collationLogs) {
            const result = log.collationResult;
            const scopeLabel = (result?.scopeId && (wardName.get(result.scopeId) || puName.get(result.scopeId))) ||
                result?.scopeId ||
                'Unknown scope';
            activities.push({
                id: `collation-${log.id}`,
                kind: 'COLLATION',
                title: collationActionLabel[log.action] ?? log.action,
                detail: `${result?.level ?? '—'} · ${scopeLabel}${log.comment ? ` · ${log.comment}` : ''}`,
                status: log.toStatus,
                createdAt: log.createdAt,
            });
        }
        for (const report of reportedIncidents) {
            const place = report.pollingUnit
                ? `${report.pollingUnit.code} — ${report.pollingUnit.name}`
                : report.ward?.name ?? 'Incident';
            activities.push({
                id: `incident-reported-${report.id}`,
                kind: 'INCIDENT_REPORTED',
                title: `Reported: ${report.title}`,
                detail: place,
                status: report.status,
                createdAt: report.createdAt,
            });
        }
        for (const report of handledIncidents) {
            const place = report.pollingUnit
                ? `${report.pollingUnit.code} — ${report.pollingUnit.name}`
                : report.ward?.name ?? 'Incident';
            activities.push({
                id: `incident-handled-${report.id}`,
                kind: 'INCIDENT_HANDLED',
                title: `${report.status === 'RESOLVED' ? 'Resolved' : 'Handled'}: ${report.title}`,
                detail: place + (report.wardComment ? ` · ${report.wardComment}` : ''),
                status: report.status,
                createdAt: report.handledAt ?? report.createdAt,
            });
        }
        activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const [agent] = await this.enrichMemberships([membership]);
        return {
            agent,
            activities: activities.slice(0, 5).map((a) => ({
                ...a,
                createdAt: a.createdAt.toISOString(),
            })),
        };
    }
    async create(user, dto) {
        this.assertManager(user);
        await this.assertCampaignAccess(user.sub, dto.campaignId);
        this.assertManageableRole(dto.role);
        const managedLgaId = await this.requireManagedLgaId(user, undefined, dto.role, dto.scopeId);
        const scope = await this.resolveScopeInLga(dto.role, dto.scopeId, managedLgaId);
        const phoneNumber = (0, phone_util_1.normalizePhoneNumber)(dto.phoneNumber);
        if (!phoneNumber) {
            throw new common_1.BadRequestException('Invalid phone number');
        }
        const email = dto.email?.trim().toLowerCase() ||
            `agent.${phoneNumber.replace(/\D/g, '')}@electromon.local`;
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const candidates = (0, phone_util_1.phoneLookupCandidates)(dto.phoneNumber);
        let existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    ...(candidates.length ? [{ phoneNumber: { in: candidates } }] : []),
                ],
            },
        });
        if (existing) {
            const otherPhone = await this.prisma.user.findFirst({
                where: {
                    id: { not: existing.id },
                    phoneNumber: { in: candidates },
                },
            });
            if (otherPhone) {
                throw new common_1.ConflictException('Phone number already in use');
            }
        }
        if (!existing) {
            existing = await this.prisma.user.create({
                data: {
                    email,
                    phoneNumber,
                    passwordHash,
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    isActive: true,
                },
            });
        }
        else {
            existing = await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    phoneNumber,
                    passwordHash,
                    isActive: true,
                    ...(dto.email ? { email } : {}),
                },
            });
        }
        const membership = await this.prisma.campaignMembership.upsert({
            where: {
                userId_campaignId: { userId: existing.id, campaignId: dto.campaignId },
            },
            create: {
                userId: existing.id,
                campaignId: dto.campaignId,
                role: dto.role,
                scopeType: scope.scopeType,
                scopeId: scope.scopeId,
                isActive: true,
            },
            update: {
                role: dto.role,
                scopeType: scope.scopeType,
                scopeId: scope.scopeId,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });
        return this.mapAgent(membership, {
            scopeName: scope.scopeName,
            wardName: scope.wardName,
            lgaName: scope.lgaName,
        });
    }
    async update(user, membershipId, dto) {
        this.assertManager(user);
        const membership = await this.prisma.campaignMembership.findUnique({
            where: { id: membershipId },
            include: {
                user: true,
            },
        });
        if (!membership)
            throw new common_1.NotFoundException('Agent not found');
        await this.assertCampaignAccess(user.sub, membership.campaignId);
        this.assertManageableRole(membership.role);
        const managedLgaId = await this.requireManagedLgaId(user, undefined, membership.role, membership.scopeId);
        await this.resolveScopeInLga(membership.role, membership.scopeId, managedLgaId);
        const nextRole = (dto.role ?? membership.role);
        this.assertManageableRole(nextRole);
        const nextScopeId = dto.scopeId ?? membership.scopeId;
        const scope = await this.resolveScopeInLga(nextRole, nextScopeId, managedLgaId);
        let phoneNumber = membership.user.phoneNumber;
        if (dto.phoneNumber) {
            phoneNumber = (0, phone_util_1.normalizePhoneNumber)(dto.phoneNumber);
            if (!phoneNumber)
                throw new common_1.BadRequestException('Invalid phone number');
            const candidates = (0, phone_util_1.phoneLookupCandidates)(dto.phoneNumber);
            const clash = await this.prisma.user.findFirst({
                where: {
                    id: { not: membership.userId },
                    phoneNumber: { in: candidates },
                },
            });
            if (clash)
                throw new common_1.ConflictException('Phone number already in use');
        }
        const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;
        await this.prisma.user.update({
            where: { id: membership.userId },
            data: {
                ...(dto.firstName ? { firstName: dto.firstName.trim() } : {}),
                ...(dto.lastName ? { lastName: dto.lastName.trim() } : {}),
                ...(dto.phoneNumber ? { phoneNumber } : {}),
                ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
                ...(passwordHash ? { passwordHash } : {}),
                ...(dto.isActive === false ? { isActive: false } : {}),
                ...(dto.isActive === true ? { isActive: true } : {}),
            },
        });
        const updated = await this.prisma.campaignMembership.update({
            where: { id: membershipId },
            data: {
                role: nextRole,
                scopeType: scope.scopeType,
                scopeId: scope.scopeId,
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });
        return this.mapAgent(updated, {
            scopeName: scope.scopeName,
            wardName: scope.wardName,
            lgaName: scope.lgaName,
        });
    }
};
exports.AgentsService = AgentsService;
exports.AgentsService = AgentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgentsService);
//# sourceMappingURL=agents.service.js.map