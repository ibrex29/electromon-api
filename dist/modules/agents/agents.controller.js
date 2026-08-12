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
exports.AgentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_config_1 = require("../../common/swagger/swagger.config");
const agents_service_1 = require("./agents.service");
const agents_dto_1 = require("./dto/agents.dto");
const AGENT_VIEW_ROLES = [
    shared_1.CampaignRole.CAMPAIGN_DIRECTOR,
    shared_1.CampaignRole.CANDIDATE,
    shared_1.CampaignRole.STATE_COLLATION_OFFICER,
    shared_1.CampaignRole.LGA_COLLATION_OFFICER,
    shared_1.CampaignRole.WARD_RA_OFFICER,
];
const AGENT_MANAGE_ROLES = [shared_1.CampaignRole.CAMPAIGN_DIRECTOR, shared_1.CampaignRole.CANDIDATE];
let AgentsController = class AgentsController {
    agentsService;
    constructor(agentsService) {
        this.agentsService = agentsService;
    }
    listOptions(user, campaignId, lgaId) {
        return this.agentsService.listOptions(user, campaignId, lgaId);
    }
    list(user, query) {
        return this.agentsService.list(user, query);
    }
    listActivities(user, membershipId) {
        return this.agentsService.listActivities(user, membershipId);
    }
    create(user, dto) {
        return this.agentsService.create(user, dto);
    }
    update(user, membershipId, dto) {
        return this.agentsService.update(user, membershipId, dto);
    }
};
exports.AgentsController = AgentsController;
__decorate([
    openapi.ApiQuery({ name: "lgaId", required: false }),
    (0, common_1.Get)('options'),
    (0, auth_decorators_1.Roles)(...AGENT_VIEW_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'List wards/PUs for filters (LGA/admin) or own ward PUs (ward officer)',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('campaignId')),
    __param(2, (0, common_1.Query)('lgaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "listOptions", null);
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorators_1.Roles)(...AGENT_VIEW_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'List agents (admin/LGA: ward+PU; ward officer: PU agents in assigned ward)',
    }),
    (0, swagger_1.ApiOkResponse)({ type: [agents_dto_1.AgentResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agents_dto_1.ListAgentsQueryDto]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':membershipId/activities'),
    (0, auth_decorators_1.Roles)(...AGENT_VIEW_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Collation and incident activity for an agent' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('membershipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "listActivities", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(...AGENT_MANAGE_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Create or assign a ward officer / PU agent (system admin)' }),
    (0, swagger_1.ApiOkResponse)({ type: agents_dto_1.AgentResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, agents_dto_1.CreateAgentDto]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':membershipId'),
    (0, auth_decorators_1.Roles)(...AGENT_MANAGE_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Update a ward officer / PU agent (system admin)' }),
    (0, swagger_1.ApiOkResponse)({ type: agents_dto_1.AgentResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, agents_dto_1.UpdateAgentDto]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "update", null);
exports.AgentsController = AgentsController = __decorate([
    (0, swagger_1.ApiTags)('agents'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agents_service_1.AgentsService])
], AgentsController);
//# sourceMappingURL=agents.controller.js.map