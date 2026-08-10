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
exports.CollationController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const collation_service_1 = require("./collation.service");
const collation_browse_service_1 = require("./collation-browse.service");
const collation_dto_1 = require("./dto/collation.dto");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
let CollationController = class CollationController {
    collationService;
    browseService;
    constructor(collationService, browseService) {
        this.collationService = collationService;
        this.browseService = browseService;
    }
    getContext(user) {
        return this.browseService.getContext(user);
    }
    browseLgas(user, page, limit, search) {
        return this.browseService.browseLgas(user, Number(page) || 1, Number(limit) || 20, search);
    }
    browseWards(user, lgaId, page, limit, search) {
        return this.browseService.browseWards(user, lgaId, Number(page) || 1, Number(limit) || 20, search);
    }
    browseMyWards(user, page, limit, search) {
        return this.browseService.browseWardsForUser(user, Number(page) || 1, Number(limit) || 20, search);
    }
    browsePollingUnits(user, wardId, page, limit, search) {
        return this.browseService.browsePollingUnits(user, wardId, Number(page) || 1, Number(limit) || 20, search);
    }
    browseMyPollingUnits(user, page, limit, search) {
        return this.browseService.browsePollingUnitsForUser(user, Number(page) || 1, Number(limit) || 20, search);
    }
    getDashboard(user) {
        return this.collationService.getDashboard(user);
    }
    listResults(user, status) {
        return this.collationService.listResults(user, status);
    }
    listPending(user) {
        return this.collationService.listPendingApprovals(user);
    }
    listLgaWardSubmissions(user) {
        return this.collationService.listLgaWardSubmissions(user);
    }
    listLgaWardPuResults(user, wardId) {
        return this.collationService.listLgaWardPuResults(user, wardId);
    }
    getLgaPuResult(user, puId) {
        return this.collationService.getLgaPuResult(user, puId);
    }
    approveAllLgaWardResults(user, dto) {
        return this.collationService.approveAllLgaWardResults(user, dto);
    }
    listWardPuSubmissions(user) {
        return this.collationService.listWardPuSubmissions(user);
    }
    upsertResult(user, dto) {
        return this.collationService.upsertResult(user, dto);
    }
    submitResult(user, id) {
        return this.collationService.submitResult(user, id);
    }
    attachEc8a(user, id, dto) {
        return this.collationService.attachEc8aPhoto(user, id, dto.photoUrl);
    }
    approveResult(user, id, dto) {
        return this.collationService.approveResult(user, id, dto);
    }
    rejectResult(user, id, dto) {
        return this.collationService.rejectResult(user, id, dto);
    }
};
exports.CollationController = CollationController;
__decorate([
    (0, common_1.Get)('context'),
    (0, swagger_1.ApiOperation)({ summary: 'Campaign and state context for dashboard header' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "getContext", null);
__decorate([
    (0, common_1.Get)('browse/lgas'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated LGA list with party totals (state-scoped)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "browseLgas", null);
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    openapi.ApiQuery({ name: "search", required: false }),
    (0, common_1.Get)('browse/lgas/:lgaId/wards'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated wards in an LGA with party totals' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('lgaId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "browseWards", null);
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    openapi.ApiQuery({ name: "search", required: false }),
    (0, common_1.Get)('browse/my-wards'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated wards for LGA-scoped user' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "browseMyWards", null);
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    openapi.ApiQuery({ name: "search", required: false }),
    (0, common_1.Get)('browse/wards/:wardId/polling-units'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated polling units in a ward' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wardId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "browsePollingUnits", null);
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    openapi.ApiQuery({ name: "search", required: false }),
    (0, common_1.Get)('browse/my-polling-units'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated polling units for ward/LGA-scoped user' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "browseMyPollingUnits", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, auth_decorators_1.Roles)(...shared_1.COLLATION_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Collation dashboard for current user',
        description: 'Returns dashboard metadata, geographic scope chain, pending approvals, and current result for the logged-in collation officer.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Dashboard payload' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('results'),
    (0, auth_decorators_1.Roles)(...shared_1.COLLATION_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'List collation results for current scope' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: shared_1.CollationResultStatus, required: false }),
    (0, swagger_1.ApiOkResponse)({ description: 'Collation results' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "listResults", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.WARD_RA_OFFICER, shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.STATE_COLLATION_OFFICER, shared_1.CampaignRole.NATIONAL_COLLATION_OFFICER),
    (0, swagger_1.ApiOperation)({
        summary: 'List submitted results awaiting approval',
        description: 'Returns results from the level immediately below the current officer scope.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Pending approval queue' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "listPending", null);
__decorate([
    (0, common_1.Get)('lga/ward-submissions'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.LGA_COORDINATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Ward collation submissions in the LGA officer scope' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "listLgaWardSubmissions", null);
__decorate([
    (0, common_1.Get)('lga/wards/:wardId/pu-results'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.LGA_COORDINATOR),
    (0, swagger_1.ApiOperation)({ summary: 'PU results within a ward (read-only for LGA review)' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "listLgaWardPuResults", null);
__decorate([
    (0, common_1.Get)('lga/polling-units/:puId/result'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.LGA_COORDINATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Single PU collation result in the LGA (read-only)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('puId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "getLgaPuResult", null);
__decorate([
    (0, common_1.Patch)('lga/approve-all-wards'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.LGA_COLLATION_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Approve all submitted ward results in the LGA at once' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, collation_dto_1.ApproveCollationResultDto]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "approveAllLgaWardResults", null);
__decorate([
    (0, common_1.Get)('ward/pu-submissions'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.WARD_RA_OFFICER, shared_1.CampaignRole.WARD_COORDINATOR),
    (0, swagger_1.ApiOperation)({ summary: 'All PU collation submissions in the ward officer scope' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "listWardPuSubmissions", null);
__decorate([
    (0, common_1.Post)('results'),
    (0, auth_decorators_1.Roles)(...shared_1.COLLATION_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update draft collation result at current scope' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, collation_dto_1.CreateCollationResultDto]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "upsertResult", null);
__decorate([
    (0, common_1.Patch)('results/:id/submit'),
    (0, auth_decorators_1.Roles)(...shared_1.COLLATION_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Submit draft result for approval at the next level' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "submitResult", null);
__decorate([
    (0, common_1.Patch)('results/:id/ec8a'),
    (0, auth_decorators_1.Roles)(...shared_1.COLLATION_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Attach an uploaded EC8A form photo to a draft result' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collation_dto_1.AttachEc8aPhotoDto]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "attachEc8a", null);
__decorate([
    (0, common_1.Patch)('results/:id/approve'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.WARD_RA_OFFICER, shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.STATE_COLLATION_OFFICER, shared_1.CampaignRole.NATIONAL_COLLATION_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a submitted result from the level below' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collation_dto_1.ApproveCollationResultDto]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "approveResult", null);
__decorate([
    (0, common_1.Patch)('results/:id/reject'),
    (0, auth_decorators_1.Roles)(shared_1.CampaignRole.WARD_RA_OFFICER, shared_1.CampaignRole.LGA_COLLATION_OFFICER, shared_1.CampaignRole.STATE_COLLATION_OFFICER, shared_1.CampaignRole.NATIONAL_COLLATION_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a submitted result from the level below' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collation_dto_1.RejectCollationResultDto]),
    __metadata("design:returntype", void 0)
], CollationController.prototype, "rejectResult", null);
exports.CollationController = CollationController = __decorate([
    (0, swagger_1.ApiTags)('collation'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('collation'),
    __metadata("design:paramtypes", [collation_service_1.CollationService,
        collation_browse_service_1.CollationBrowseService])
], CollationController);
//# sourceMappingURL=collation.controller.js.map