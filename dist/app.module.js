"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const audit_interceptor_1 = require("./common/audit/audit.interceptor");
const audit_module_1 = require("./common/audit/audit.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const metrics_interceptor_1 = require("./common/interceptors/metrics.interceptor");
const logging_module_1 = require("./common/logging/logging.module");
const metrics_controller_1 = require("./common/metrics/metrics.controller");
const metrics_module_1 = require("./common/metrics/metrics.module");
const prisma_module_1 = require("./common/prisma/prisma.module");
const redis_module_1 = require("./common/redis/redis.module");
const agents_module_1 = require("./modules/agents/agents.module");
const auth_module_1 = require("./modules/auth/auth.module");
const campaign_module_1 = require("./modules/campaign/campaign.module");
const collation_module_1 = require("./modules/collation/collation.module");
const health_module_1 = require("./modules/health/health.module");
const structure_module_1 = require("./modules/structure/structure.module");
const commitments_module_1 = require("./modules/commitments/commitments.module");
const support_groups_module_1 = require("./modules/support-groups/support-groups.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const field_reports_module_1 = require("./modules/field-reports/field-reports.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const polling_units_module_1 = require("./modules/polling-units/polling-units.module");
const situation_room_module_1 = require("./modules/situation-room/situation-room.module");
const volunteers_module_1 = require("./modules/volunteers/volunteers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '../../.env'],
            }),
            logging_module_1.LoggingModule,
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            metrics_module_1.MetricsModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            agents_module_1.AgentsModule,
            campaign_module_1.CampaignModule,
            collation_module_1.CollationModule,
            structure_module_1.StructureModule,
            support_groups_module_1.SupportGroupsModule,
            commitments_module_1.CommitmentsModule,
            volunteers_module_1.VolunteersModule,
            polling_units_module_1.PollingUnitsModule,
            situation_room_module_1.SituationRoomModule,
            field_reports_module_1.FieldReportsModule,
            uploads_module_1.UploadsModule,
            analytics_module_1.AnalyticsModule,
            health_module_1.HealthModule,
        ],
        controllers: [metrics_controller_1.MetricsController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_FILTER, useClass: global_exception_filter_1.GlobalExceptionFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: metrics_interceptor_1.MetricsInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map