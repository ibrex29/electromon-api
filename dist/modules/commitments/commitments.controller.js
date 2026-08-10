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
exports.CommitmentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const audit_decorators_1 = require("../../common/audit/audit.decorators");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const commitment_dto_1 = require("./dto/commitment.dto");
const commitment_response_dto_1 = require("./dto/commitment-response.dto");
const commitments_service_1 = require("./commitments.service");
let CommitmentsController = class CommitmentsController {
    commitmentsService;
    constructor(commitmentsService) {
        this.commitmentsService = commitmentsService;
    }
    list(user, query) {
        return this.commitmentsService.list(user, query);
    }
    findOne(user, id) {
        return this.commitmentsService.findOne(user, id);
    }
    create(user, dto) {
        return this.commitmentsService.create(user, dto);
    }
    update(user, id, dto) {
        return this.commitmentsService.update(user, id, dto);
    }
    remove(user, id) {
        return this.commitmentsService.remove(user, id);
    }
};
exports.CommitmentsController = CommitmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List commitments for a campaign' }),
    (0, swagger_1.ApiOkResponse)({ type: [commitment_response_dto_1.CommitmentResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commitment_dto_1.ListCommitmentsQueryDto]),
    __metadata("design:returntype", void 0)
], CommitmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commitment by ID' }),
    (0, swagger_1.ApiOkResponse)({ type: commitment_response_dto_1.CommitmentResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommitmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.SUPPORT_GROUP_LEADER),
    (0, audit_decorators_1.AuditAction)('commitment.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new commitment' }),
    (0, swagger_1.ApiCreatedResponse)({ type: commitment_response_dto_1.CommitmentResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commitment_dto_1.CreateCommitmentDto]),
    __metadata("design:returntype", void 0)
], CommitmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR, shared_1.CampaignRole.LGA_COORDINATOR, shared_1.CampaignRole.SUPPORT_GROUP_LEADER),
    (0, audit_decorators_1.AuditAction)('commitment.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a commitment' }),
    (0, swagger_1.ApiOkResponse)({ type: commitment_response_dto_1.CommitmentResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, commitment_dto_1.UpdateCommitmentDto]),
    __metadata("design:returntype", void 0)
], CommitmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.STATE_COORDINATOR),
    (0, audit_decorators_1.AuditAction)('commitment.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a commitment' }),
    (0, swagger_1.ApiOkResponse)({ type: api_response_dto_1.MessageResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommitmentsController.prototype, "remove", null);
exports.CommitmentsController = CommitmentsController = __decorate([
    (0, swagger_1.ApiTags)('commitments'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('commitments'),
    __metadata("design:paramtypes", [commitments_service_1.CommitmentsService])
], CommitmentsController);
//# sourceMappingURL=commitments.controller.js.map