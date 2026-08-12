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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const field_report_dto_1 = require("./dto/field-report.dto");
const field_reports_service_1 = require("./field-reports.service");
let FieldReportsController = class FieldReportsController {
    fieldReportsService;
    constructor(fieldReportsService) {
        this.fieldReportsService = fieldReportsService;
    }
    list(user, query) {
        return this.fieldReportsService.list(user, query);
    }
    create(user, dto) {
        return this.fieldReportsService.create(user, dto);
    }
    updateStatus(user, id, dto) {
        return this.fieldReportsService.updateStatus(user, id, dto);
    }
};
exports.FieldReportsController = FieldReportsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List field reports for a campaign' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, field_report_dto_1.ListFieldReportsQueryDto]),
    __metadata("design:returntype", void 0)
], FieldReportsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COLLATION_OFFICER, shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.WARD_RA_OFFICER, shared_1.CampaignRole.POLLING_AGENT, shared_1.CampaignRole.VOLUNTEER, shared_1.CampaignRole.VOLUNTEER_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('field_report.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a field report' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Field report created' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, field_report_dto_1.CreateFieldReportDto]),
    __metadata("design:returntype", void 0)
], FieldReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COLLATION_OFFICER, shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.WARD_RA_OFFICER),
    (0, audit_decorators_1.AuditAction)('field_report.update_status'),
    (0, swagger_1.ApiOperation)({ summary: 'Escalate, resolve, or comment on a field report' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, field_report_dto_1.UpdateFieldReportStatusDto]),
    __metadata("design:returntype", void 0)
], FieldReportsController.prototype, "updateStatus", null);
exports.FieldReportsController = FieldReportsController = __decorate([
    (0, swagger_1.ApiTags)('field-reports'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('field-reports'),
    __metadata("design:paramtypes", [field_reports_service_1.FieldReportsService])
], FieldReportsController);
//# sourceMappingURL=field-reports.controller.js.map