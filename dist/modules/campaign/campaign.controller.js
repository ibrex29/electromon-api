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
exports.CampaignController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const campaign_service_1 = require("./campaign.service");
const structure_response_dto_1 = require("../structure/dto/structure-response.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_config_1 = require("../../common/swagger/swagger.config");
let CampaignController = class CampaignController {
    campaignService;
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    list(user) {
        return this.campaignService.listForUser(user.sub);
    }
    getOne(id) {
        return this.campaignService.findById(id);
    }
};
exports.CampaignController = CampaignController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List campaigns for current user',
        description: 'Returns all campaigns the authenticated user is a member of.',
    }),
    (0, swagger_1.ApiOkResponse)({ type: [structure_response_dto_1.CampaignListItemDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CampaignController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get campaign details',
        description: 'Returns campaign with full geographic tree (state, LGAs, wards, polling unit counts).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID', example: 'cms147z3t001www9ktkqgluw0' }),
    (0, swagger_1.ApiOkResponse)({ type: structure_response_dto_1.CampaignListItemDto }),
    (0, swagger_1.ApiNotFoundResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CampaignController.prototype, "getOne", null);
exports.CampaignController = CampaignController = __decorate([
    (0, swagger_1.ApiTags)('campaigns'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService])
], CampaignController);
//# sourceMappingURL=campaign.controller.js.map