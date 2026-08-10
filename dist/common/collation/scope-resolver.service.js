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
exports.ScopeResolverService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
const prisma_service_1 = require("../prisma/prisma.service");
let ScopeResolverService = class ScopeResolverService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveScopeName(scopeType, scopeId) {
        if (!scopeType || !scopeId)
            return undefined;
        switch (scopeType) {
            case shared_1.ScopeType.POLLING_UNIT: {
                const pu = await this.prisma.pollingUnit.findUnique({ where: { id: scopeId } });
                return pu ? `${pu.name} (${pu.code})` : undefined;
            }
            case shared_1.ScopeType.WARD: {
                const ward = await this.prisma.ward.findUnique({ where: { id: scopeId } });
                return ward?.name;
            }
            case shared_1.ScopeType.LGA: {
                const lga = await this.prisma.lGA.findUnique({ where: { id: scopeId } });
                return lga?.name;
            }
            case shared_1.ScopeType.STATE: {
                const state = await this.prisma.state.findUnique({ where: { id: scopeId } });
                return state?.name;
            }
            case shared_1.ScopeType.NATIONAL:
                return 'National Collation Centre (Abuja)';
            case shared_1.ScopeType.CAMPAIGN: {
                const campaign = await this.prisma.campaign.findUnique({ where: { id: scopeId } });
                return campaign?.name;
            }
            default:
                return undefined;
        }
    }
    async buildDashboard(role, scopeType, scopeId) {
        const scopeName = await this.resolveScopeName(scopeType, scopeId);
        return (0, shared_1.buildDashboardMeta)(role, scopeType ?? undefined, scopeId, scopeName);
    }
    async resolveScopeChain(scopeType, scopeId) {
        switch (scopeType) {
            case shared_1.ScopeType.POLLING_UNIT: {
                const pu = await this.prisma.pollingUnit.findUniqueOrThrow({
                    where: { id: scopeId },
                    include: { ward: { include: { lga: { include: { state: true } } } } },
                });
                return {
                    pollingUnit: { id: pu.id, code: pu.code, name: pu.name },
                    ward: {
                        id: pu.ward.id,
                        name: pu.ward.name,
                        registrationAreaCode: pu.ward.registrationAreaCode,
                    },
                    lga: { id: pu.ward.lga.id, name: pu.ward.lga.name },
                    state: { id: pu.ward.lga.state.id, name: pu.ward.lga.state.name, code: pu.ward.lga.state.code },
                    national: { id: shared_1.NATIONAL_SCOPE_ID, name: 'National Collation Centre (Abuja)' },
                };
            }
            case shared_1.ScopeType.WARD: {
                const ward = await this.prisma.ward.findUniqueOrThrow({
                    where: { id: scopeId },
                    include: { lga: { include: { state: true } } },
                });
                return {
                    ward: {
                        id: ward.id,
                        name: ward.name,
                        registrationAreaCode: ward.registrationAreaCode,
                    },
                    lga: { id: ward.lga.id, name: ward.lga.name },
                    state: { id: ward.lga.state.id, name: ward.lga.state.name, code: ward.lga.state.code },
                    national: { id: shared_1.NATIONAL_SCOPE_ID, name: 'National Collation Centre (Abuja)' },
                };
            }
            case shared_1.ScopeType.LGA: {
                const lga = await this.prisma.lGA.findUniqueOrThrow({
                    where: { id: scopeId },
                    include: { state: true },
                });
                return {
                    lga: { id: lga.id, name: lga.name },
                    state: { id: lga.state.id, name: lga.state.name, code: lga.state.code },
                    national: { id: shared_1.NATIONAL_SCOPE_ID, name: 'National Collation Centre (Abuja)' },
                };
            }
            case shared_1.ScopeType.STATE: {
                const state = await this.prisma.state.findUniqueOrThrow({ where: { id: scopeId } });
                return {
                    state: { id: state.id, name: state.name, code: state.code },
                    national: { id: shared_1.NATIONAL_SCOPE_ID, name: 'National Collation Centre (Abuja)' },
                };
            }
            case shared_1.ScopeType.NATIONAL:
                return {
                    national: { id: shared_1.NATIONAL_SCOPE_ID, name: 'National Collation Centre (Abuja)' },
                };
            default:
                return {};
        }
    }
    getLevelForUser(role, scopeType) {
        const fromRole = role ? (0, shared_1.getCollationLevelForRole)(role) : undefined;
        if (fromRole)
            return fromRole;
        if (!scopeType)
            return undefined;
        const map = {
            [shared_1.ScopeType.POLLING_UNIT]: shared_1.CollationLevel.POLLING_UNIT,
            [shared_1.ScopeType.WARD]: shared_1.CollationLevel.WARD,
            [shared_1.ScopeType.LGA]: shared_1.CollationLevel.LGA,
            [shared_1.ScopeType.STATE]: shared_1.CollationLevel.STATE,
            [shared_1.ScopeType.NATIONAL]: shared_1.CollationLevel.NATIONAL,
        };
        return map[scopeType];
    }
    getChildScopeType(level) {
        const child = (0, shared_1.getChildLevel)(level);
        if (!child)
            return undefined;
        const map = {
            [shared_1.CollationLevel.POLLING_UNIT]: shared_1.ScopeType.WARD,
            [shared_1.CollationLevel.WARD]: shared_1.ScopeType.LGA,
            [shared_1.CollationLevel.LGA]: shared_1.ScopeType.STATE,
            [shared_1.CollationLevel.STATE]: shared_1.ScopeType.NATIONAL,
            [shared_1.CollationLevel.NATIONAL]: shared_1.ScopeType.NATIONAL,
        };
        return map[level];
    }
};
exports.ScopeResolverService = ScopeResolverService;
exports.ScopeResolverService = ScopeResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScopeResolverService);
//# sourceMappingURL=scope-resolver.service.js.map