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
exports.StructureController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const structure_service_1 = require("./structure.service");
const structure_response_dto_1 = require("./dto/structure-response.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const swagger_config_1 = require("../../common/swagger/swagger.config");
let StructureController = class StructureController {
    structureService;
    constructor(structureService) {
        this.structureService = structureService;
    }
    getStates() {
        return this.structureService.getStates();
    }
    getLgas(stateId) {
        return this.structureService.getLgasByState(stateId);
    }
    getWards(lgaId) {
        return this.structureService.getWardsByLga(lgaId);
    }
    getPollingUnits(wardId) {
        return this.structureService.getPollingUnitsByWard(wardId);
    }
    getCollationHierarchy() {
        return this.structureService.getCollationHierarchy();
    }
    getCoverage(campaignId) {
        return this.structureService.getCoverageStats(campaignId);
    }
};
exports.StructureController = StructureController;
__decorate([
    (0, common_1.Get)('states'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all states',
        description: 'Returns all 37 Nigerian states (+ FCT) with LGA and campaign counts.',
    }),
    (0, swagger_1.ApiOkResponse)({ type: [structure_response_dto_1.StateResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getStates", null);
__decorate([
    (0, common_1.Get)('states/:stateId/lgas'),
    (0, swagger_1.ApiOperation)({
        summary: 'List LGAs in a state',
        description: 'Returns local government areas with senatorial district and ward counts.',
    }),
    (0, swagger_1.ApiParam)({ name: 'stateId', description: 'State ID', example: 'cms147za8001xww9ktd46y7m0' }),
    (0, swagger_1.ApiOkResponse)({ type: [structure_response_dto_1.LgaResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('stateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getLgas", null);
__decorate([
    (0, common_1.Get)('lgas/:lgaId/wards'),
    (0, swagger_1.ApiOperation)({
        summary: 'List wards in an LGA',
        description: 'Returns wards with polling unit and volunteer counts.',
    }),
    (0, swagger_1.ApiParam)({ name: 'lgaId', description: 'LGA ID' }),
    (0, swagger_1.ApiOkResponse)({ type: [structure_response_dto_1.WardResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('lgaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getWards", null);
__decorate([
    (0, common_1.Get)('wards/:wardId/polling-units'),
    (0, swagger_1.ApiOperation)({
        summary: 'List polling units in a ward',
        description: 'Returns all polling units for a given ward.',
    }),
    (0, swagger_1.ApiParam)({ name: 'wardId', description: 'Ward ID' }),
    (0, swagger_1.ApiOkResponse)({ type: [structure_response_dto_1.PollingUnitResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('wardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getPollingUnits", null);
__decorate([
    (0, common_1.Get)('collation-hierarchy'),
    (0, swagger_1.ApiOperation)({
        summary: 'Electoral collation hierarchy',
        description: 'Returns the 5-level approval chain: PU → Ward/RA → LGA → State Collation → National Collation (Abuja).',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Collation hierarchy levels' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getCollationHierarchy", null);
__decorate([
    (0, common_1.Get)('coverage'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get campaign structure coverage stats',
        description: 'Returns total LGAs, wards, polling units, and assigned coordinators for a campaign.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'campaignId',
        required: true,
        description: 'Campaign ID',
        example: 'cms147z3t001www9ktkqgluw0',
    }),
    (0, swagger_1.ApiOkResponse)({ type: structure_response_dto_1.CoverageStatsDto }),
    (0, swagger_1.ApiNotFoundResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StructureController.prototype, "getCoverage", null);
exports.StructureController = StructureController = __decorate([
    (0, swagger_1.ApiTags)('structure'),
    (0, swagger_1.ApiBearerAuth)(swagger_config_1.SWAGGER_BEARER_AUTH),
    (0, common_1.Controller)('structure'),
    __metadata("design:paramtypes", [structure_service_1.StructureService])
], StructureController);
//# sourceMappingURL=structure.controller.js.map