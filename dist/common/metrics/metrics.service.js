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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const prisma_service_1 = require("../prisma/prisma.service");
let MetricsService = class MetricsService {
    prisma;
    registry = new prom_client_1.Registry();
    httpRequestsTotal;
    httpRequestDuration;
    activeSessions;
    dbPoolTotal;
    dbPoolWaiting;
    dependencyUp;
    constructor(prisma) {
        this.prisma = prisma;
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'electromon_http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'electromon_http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
            registers: [this.registry],
        });
        this.activeSessions = new prom_client_1.Gauge({
            name: 'electromon_active_sessions',
            help: 'Active refresh token sessions',
            registers: [this.registry],
        });
        this.dbPoolTotal = new prom_client_1.Gauge({
            name: 'electromon_db_pool_total',
            help: 'Total database pool connections',
            registers: [this.registry],
        });
        this.dbPoolWaiting = new prom_client_1.Gauge({
            name: 'electromon_db_pool_waiting',
            help: 'Requests waiting for a database connection',
            registers: [this.registry],
        });
        this.dependencyUp = new prom_client_1.Gauge({
            name: 'electromon_dependency_up',
            help: 'Dependency health (1=up, 0=down)',
            labelNames: ['dependency'],
            registers: [this.registry],
        });
    }
    onModuleInit() {
        setInterval(() => void this.refreshInternalMetrics(), 15_000);
    }
    recordHttpRequest(method, route, status, durationSeconds) {
        const labels = { method, route, status: String(status) };
        this.httpRequestsTotal.inc(labels);
        this.httpRequestDuration.observe(labels, durationSeconds);
    }
    setDependencyStatus(dependency, up) {
        this.dependencyUp.set({ dependency }, up ? 1 : 0);
    }
    async metrics() {
        await this.refreshInternalMetrics();
        return this.registry.metrics();
    }
    async refreshInternalMetrics() {
        try {
            const sessions = await this.prisma.refreshToken.count({
                where: { expiresAt: { gt: new Date() } },
            });
            this.activeSessions.set(sessions);
        }
        catch {
            this.activeSessions.set(0);
        }
        const pool = this.prisma.getPoolStats();
        this.dbPoolTotal.set(pool.total);
        this.dbPoolWaiting.set(pool.waiting);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map