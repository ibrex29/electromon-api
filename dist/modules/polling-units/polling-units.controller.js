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
exports.PollingUnitsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const polling_unit_dto_1 = require("./dto/polling-unit.dto");
const polling_unit_response_dto_1 = require("./dto/polling-unit-response.dto");
const polling_units_service_1 = require("./polling-units.service");
let PollingUnitsController = class PollingUnitsController {
    pollingUnitsService;
    constructor(pollingUnitsService) {
        this.pollingUnitsService = pollingUnitsService;
    }
    list(user, query) {
        return this.pollingUnitsService.list(user, query);
    }
    findOne(user, id, campaignId) {
        return this.pollingUnitsService.findOne(user, id, campaignId);
    }
    create(user, dto) {
        return this.pollingUnitsService.create(user, dto);
    }
    update(user, id, dto) {
        return this.pollingUnitsService.update(user, id, dto);
    }
    remove(user, id, campaignId) {
        return this.pollingUnitsService.remove(user, id, campaignId);
    }
};
exports.PollingUnitsController = PollingUnitsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List polling units for a Jigawa campaign' }),
    (0, swagger_1.ApiOkResponse)({ type: [polling_unit_response_dto_1.PollingUnitResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, polling_unit_dto_1.ListPollingUnitsQueryDto]),
    __metadata("design:returntype", void 0)
], PollingUnitsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get polling unit by ID' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: polling_unit_response_dto_1.PollingUnitResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PollingUnitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.WARD_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('polling_unit.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a polling unit' }),
    (0, swagger_1.ApiCreatedResponse)({ type: polling_unit_response_dto_1.PollingUnitResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, polling_unit_dto_1.CreatePollingUnitDto]),
    __metadata("design:returntype", void 0)
], PollingUnitsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.WARD_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT),
    (0, audit_decorators_1.AuditAction)('polling_unit.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update polling unit intelligence' }),
    (0, swagger_1.ApiOkResponse)({ type: polling_unit_response_dto_1.PollingUnitResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, polling_unit_dto_1.UpdatePollingUnitDto]),
    __metadata("design:returntype", void 0)
], PollingUnitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('polling_unit.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a polling unit' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: api_response_dto_1.MessageResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PollingUnitsController.prototype, "remove", null);
exports.PollingUnitsController = PollingUnitsController = __decorate([
    (0, swagger_1.ApiTags)('polling-units'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('polling-units'),
    __metadata("design:paramtypes", [polling_units_service_1.PollingUnitsService])
], PollingUnitsController);
//# sourceMappingURL=polling-units.controller.js.map