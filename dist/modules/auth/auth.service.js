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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const scope_resolver_service_1 = require("../../common/collation/scope-resolver.service");
const phone_util_1 = require("./phone.util");
let AuthService = class AuthService {
    prisma;
    jwtService;
    scopeResolver;
    constructor(prisma, jwtService, scopeResolver) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.scopeResolver = scopeResolver;
    }
    async validateUser(phoneNumber, password) {
        const candidates = (0, phone_util_1.phoneLookupCandidates)(phoneNumber);
        if (candidates.length === 0) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: candidates.map((phone) => ({ phoneNumber: phone })),
            },
            include: {
                memberships: {
                    where: { isActive: true },
                    take: 1,
                },
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async login(dto, ipAddress) {
        const user = await this.validateUser(dto.phoneNumber, dto.password);
        const membership = user.memberships[0];
        const payload = {
            sub: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            campaignId: membership?.campaignId,
            role: membership?.role,
            scopeType: membership?.scopeType,
            scopeId: membership?.scopeId ?? undefined,
        };
        const tokens = await this.generateTokens(payload, user.id);
        const dashboard = membership?.role
            ? await this.scopeResolver.buildDashboard(membership.role, membership.scopeType, membership.scopeId)
            : undefined;
        void this.recordAuthActivity(user.id, membership?.campaignId, 'auth.login', ipAddress);
        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                role: membership?.role,
                scopeType: membership?.scopeType,
                scopeId: membership?.scopeId,
                campaignId: membership?.campaignId,
                mfaEnabled: user.mfaEnabled,
                dashboard,
            },
            ...tokens,
        };
    }
    async register(dto) {
        const phoneNumber = (0, phone_util_1.normalizePhoneNumber)(dto.phoneNumber);
        if (!phoneNumber) {
            throw new common_1.BadRequestException('Invalid phone number');
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { phoneNumber }],
            },
        });
        if (existing) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                phoneNumber,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });
        return { id: user.id, email: user.email, phoneNumber: user.phoneNumber };
    }
    async refresh(refreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        memberships: { where: { isActive: true }, take: 1 },
                    },
                },
            },
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const membership = stored.user.memberships[0];
        const payload = {
            sub: stored.user.id,
            email: stored.user.email,
            phoneNumber: stored.user.phoneNumber,
            campaignId: membership?.campaignId,
            role: membership?.role,
            scopeType: membership?.scopeType,
            scopeId: membership?.scopeId ?? undefined,
        };
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        return this.generateTokens(payload, stored.user.id);
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async getSession(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            include: {
                memberships: {
                    where: { isActive: true },
                    include: { campaign: true },
                },
            },
        });
        const memberships = await Promise.all(user.memberships.map(async (m) => ({
            campaignId: m.campaignId,
            campaignName: m.campaign.name,
            role: m.role,
            scopeType: m.scopeType,
            scopeId: m.scopeId,
            scopeName: await this.scopeResolver.resolveScopeName(m.scopeType, m.scopeId),
            dashboard: await this.scopeResolver.buildDashboard(m.role, m.scopeType, m.scopeId),
        })));
        return {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            mfaEnabled: user.mfaEnabled,
            memberships,
        };
    }
    async generateTokens(payload, userId) {
        const accessToken = this.jwtService.sign({ ...payload }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: 900,
        });
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    async recordAuthActivity(userId, campaignId, action, ipAddress) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    campaignId,
                    action,
                    resource: 'auth',
                    ipAddress,
                },
            });
        }
        catch {
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        scope_resolver_service_1.ScopeResolverService])
], AuthService);
//# sourceMappingURL=auth.service.js.map