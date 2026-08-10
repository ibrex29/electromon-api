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
exports.SupportGroupsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const support_group_dto_1 = require("./dto/support-group.dto");
const support_group_response_dto_1 = require("./dto/support-group-response.dto");
const support_groups_service_1 = require("./support-groups.service");
let SupportGroupsController = class SupportGroupsController {
    supportGroupsService;
    constructor(supportGroupsService) {
        this.supportGroupsService = supportGroupsService;
    }
    list(user, query) {
        return this.supportGroupsService.list(user, query);
    }
    findOne(user, id) {
        return this.supportGroupsService.findOne(user, id);
    }
    create(user, dto) {
        return this.supportGroupsService.create(user, dto);
    }
    update(user, id, dto) {
        return this.supportGroupsService.update(user, id, dto);
    }
    remove(user, id) {
        return this.supportGroupsService.remove(user, id);
    }
};
exports.SupportGroupsController = SupportGroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List support groups for a Jigawa campaign' }),
    (0, swagger_1.ApiOkResponse)({ type: [support_group_response_dto_1.SupportGroupResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, support_group_dto_1.ListSupportGroupsQueryDto]),
    __metadata("design:returntype", void 0)
], SupportGroupsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get support group by ID' }),
    (0, swagger_1.ApiOkResponse)({ type: support_group_response_dto_1.SupportGroupResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SupportGroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('support_group.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new support group' }),
    (0, swagger_1.ApiCreatedResponse)({ type: support_group_response_dto_1.SupportGroupResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, support_group_dto_1.CreateSupportGroupDto]),
    __metadata("design:returntype", void 0)
], SupportGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('support_group.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a support group' }),
    (0, swagger_1.ApiOkResponse)({ type: support_group_response_dto_1.SupportGroupResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, support_group_dto_1.UpdateSupportGroupDto]),
    __metadata("design:returntype", void 0)
], SupportGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('support_group.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a support group' }),
    (0, swagger_1.ApiOkResponse)({ type: api_response_dto_1.MessageResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SupportGroupsController.prototype, "remove", null);
exports.SupportGroupsController = SupportGroupsController = __decorate([
    (0, swagger_1.ApiTags)('support-groups'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('support-groups'),
    __metadata("design:paramtypes", [support_groups_service_1.SupportGroupsService])
], SupportGroupsController);
//# sourceMappingURL=support-groups.controller.js.map