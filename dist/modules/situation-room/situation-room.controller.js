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
exports.SituationRoomController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const situation_update_dto_1 = require("./dto/situation-update.dto");
const situation_update_response_dto_1 = require("./dto/situation-update-response.dto");
const situation_room_service_1 = require("./situation-room.service");
let SituationRoomController = class SituationRoomController {
    situationRoomService;
    constructor(situationRoomService) {
        this.situationRoomService = situationRoomService;
    }
    summary(user, query) {
        return this.situationRoomService.getSummary(user, query.campaignId);
    }
    list(user, query) {
        return this.situationRoomService.list(user, query);
    }
    findOne(user, id, campaignId) {
        return this.situationRoomService.findOne(user, id, campaignId);
    }
    create(user, dto) {
        return this.situationRoomService.create(user, dto);
    }
    update(user, id, dto) {
        return this.situationRoomService.update(user, id, dto);
    }
    remove(user, id, campaignId) {
        return this.situationRoomService.remove(user, id, campaignId);
    }
};
exports.SituationRoomController = SituationRoomController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Election day situation summary' }),
    (0, swagger_1.ApiOkResponse)({ type: situation_update_response_dto_1.SituationSummaryDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, situation_update_dto_1.SituationSummaryQueryDto]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('updates'),
    (0, swagger_1.ApiOperation)({ summary: 'List situation updates for a campaign' }),
    (0, swagger_1.ApiOkResponse)({ type: [situation_update_response_dto_1.SituationUpdateResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, situation_update_dto_1.ListSituationUpdatesQueryDto]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('updates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get situation update by ID' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: situation_update_response_dto_1.SituationUpdateResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('updates'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.WARD_COORDINATOR, shared_1.CampaignRole.POLLING_UNIT_OFFICER, shared_1.CampaignRole.POLLING_AGENT_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT),
    (0, audit_decorators_1.AuditAction)('situation_update.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Post a situation update from the field' }),
    (0, swagger_1.ApiCreatedResponse)({ type: situation_update_response_dto_1.SituationUpdateResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, situation_update_dto_1.CreateSituationUpdateDto]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('updates/:id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.WARD_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT_COORDINATOR, shared_1.CampaignRole.POLLING_AGENT),
    (0, audit_decorators_1.AuditAction)('situation_update.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a situation update' }),
    (0, swagger_1.ApiOkResponse)({ type: situation_update_response_dto_1.SituationUpdateResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, situation_update_dto_1.UpdateSituationUpdateDto]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('updates/:id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('situation_update.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a situation update' }),
    (0, swagger_1.ApiQuery)({ name: 'campaignId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: api_response_dto_1.MessageResponseDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SituationRoomController.prototype, "remove", null);
exports.SituationRoomController = SituationRoomController = __decorate([
    (0, swagger_1.ApiTags)('situation-room'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('situation-room'),
    __metadata("design:paramtypes", [situation_room_service_1.SituationRoomService])
], SituationRoomController);
//# sourceMappingURL=situation-room.controller.js.map