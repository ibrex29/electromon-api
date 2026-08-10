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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_decorators_1 = require("./audit.decorators");
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let AuditInterceptor = class AuditInterceptor {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const skipAudit = this.reflector.getAllAndOverride(audit_decorators_1.SKIP_AUDIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAudit) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        if (!MUTATING_METHODS.has(request.method) || !request.user?.sub) {
            return next.handle();
        }
        const auditAction = this.reflector.getAllAndOverride(audit_decorators_1.AUDIT_ACTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                void this.writeLog(request, auditAction);
            },
        }));
    }
    async writeLog(request, auditAction) {
        const user = request.user;
        if (!user?.sub)
            return;
        const route = request.route?.path ?? request.url.split('?')[0];
        const resource = route.split('/').filter(Boolean)[0] ?? 'unknown';
        try {
            await this.prisma.activityLog.create({
                data: {
                    userId: user.sub,
                    campaignId: user.campaignId,
                    action: auditAction ?? `${request.method} ${route}`,
                    resource,
                    metadata: {
                        method: request.method,
                        path: route,
                    },
                    ipAddress: request.ip,
                },
            });
        }
        catch {
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map