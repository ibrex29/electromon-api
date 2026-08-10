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
exports.HealthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const metrics_service_1 = require("../../common/metrics/metrics.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
let HealthController = class HealthController {
    prisma;
    redis;
    metrics;
    constructor(prisma, redis, metrics) {
        this.prisma = prisma;
        this.redis = redis;
        this.metrics = metrics;
    }
    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async ready() {
        const checks = await this.runChecks();
        const healthy = Object.values(checks).every((value) => value === 'connected');
        this.metrics.setDependencyStatus('postgres', checks.database === 'connected');
        this.metrics.setDependencyStatus('redis', checks.redis === 'connected');
        return {
            status: healthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            checks,
        };
    }
    async check() {
        return this.ready();
    }
    async runChecks() {
        let database = 'connected';
        let redis = 'connected';
        try {
            await this.prisma.$queryRaw `SELECT 1`;
        }
        catch {
            database = 'disconnected';
        }
        const redisOk = await this.redis.ping();
        if (!redisOk) {
            redis = 'disconnected';
        }
        return { database, redis };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe', description: 'Process is running.' }),
    (0, swagger_1.ApiOkResponse)({
        schema: { example: { status: 'ok', timestamp: '2026-07-26T00:00:00.000Z' } },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({
        summary: 'Readiness probe',
        description: 'Checks database and Redis before routing traffic.',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            example: {
                status: 'ok',
                timestamp: '2026-07-26T00:00:00.000Z',
                checks: { database: 'connected', redis: 'connected' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check (alias for readiness)',
        description: 'Backward-compatible alias used by Docker healthchecks.',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, audit_decorators_1.SkipAudit)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        metrics_service_1.MetricsService])
], HealthController);
//# sourceMappingURL=health.controller.js.map