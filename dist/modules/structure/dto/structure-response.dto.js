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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignListItemDto = exports.CoverageStatsDto = exports.PollingUnitResponseDto = exports.WardResponseDto = exports.LgaResponseDto = exports.SenatorialDistrictDto = exports.StateResponseDto = exports.CountDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class CountDto {
    lgas;
    wards;
    pollingUnits;
    volunteers;
    supportGroups;
    fieldReports;
    campaigns;
    static _OPENAPI_METADATA_FACTORY() {
        return { lgas: { required: false, type: () => Number }, wards: { required: false, type: () => Number }, pollingUnits: { required: false, type: () => Number }, volunteers: { required: false, type: () => Number }, supportGroups: { required: false, type: () => Number }, fieldReports: { required: false, type: () => Number }, campaigns: { required: false, type: () => Number } };
    }
}
exports.CountDto = CountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 27 }),
    __metadata("design:type", Number)
], CountDto.prototype, "lgas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CountDto.prototype, "wards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CountDto.prototype, "pollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], CountDto.prototype, "volunteers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], CountDto.prototype, "supportGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], CountDto.prototype, "fieldReports", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CountDto.prototype, "campaigns", void 0);
class StateResponseDto {
    id;
    name;
    code;
    _count;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, code: { required: true, type: () => String }, _count: { required: false, type: () => require("./structure-response.dto").CountDto } };
    }
}
exports.StateResponseDto = StateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147za8001xww9ktd46y7m0' }),
    __metadata("design:type", String)
], StateResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jigawa' }),
    __metadata("design:type", String)
], StateResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JI' }),
    __metadata("design:type", String)
], StateResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CountDto }),
    __metadata("design:type", CountDto)
], StateResponseDto.prototype, "_count", void 0);
class SenatorialDistrictDto {
    id;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.SenatorialDistrictDto = SenatorialDistrictDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SenatorialDistrictDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jigawa North West' }),
    __metadata("design:type", String)
], SenatorialDistrictDto.prototype, "name", void 0);
class LgaResponseDto {
    id;
    name;
    stateId;
    senatorialDistrict;
    _count;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, stateId: { required: true, type: () => String }, senatorialDistrict: { required: false, type: () => require("./structure-response.dto").SenatorialDistrictDto }, _count: { required: false, type: () => require("./structure-response.dto").CountDto } };
    }
}
exports.LgaResponseDto = LgaResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LgaResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia' }),
    __metadata("design:type", String)
], LgaResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LgaResponseDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: SenatorialDistrictDto }),
    __metadata("design:type", SenatorialDistrictDto)
], LgaResponseDto.prototype, "senatorialDistrict", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CountDto }),
    __metadata("design:type", CountDto)
], LgaResponseDto.prototype, "_count", void 0);
class WardResponseDto {
    id;
    name;
    lgaId;
    latitude;
    longitude;
    _count;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, lgaId: { required: true, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, _count: { required: false, type: () => require("./structure-response.dto").CountDto } };
    }
}
exports.WardResponseDto = WardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WardResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Ward A' }),
    __metadata("design:type", String)
], WardResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WardResponseDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12.4534 }),
    __metadata("design:type", Number)
], WardResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10.0411 }),
    __metadata("design:type", Number)
], WardResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CountDto }),
    __metadata("design:type", CountDto)
], WardResponseDto.prototype, "_count", void 0);
class PollingUnitResponseDto {
    id;
    code;
    name;
    wardId;
    latitude;
    longitude;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, code: { required: true, type: () => String }, name: { required: true, type: () => String }, wardId: { required: true, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, status: { required: true, type: () => String } };
    }
}
exports.PollingUnitResponseDto = PollingUnitResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JI-HD-001' }),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Central PU 001' }),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12.4534 }),
    __metadata("design:type", Number)
], PollingUnitResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10.0411 }),
    __metadata("design:type", Number)
], PollingUnitResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "status", void 0);
class CoverageStatsDto {
    campaignId;
    state;
    totalLgas;
    totalWards;
    totalPollingUnits;
    assignedCoordinators;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, state: { required: true, type: () => String }, totalLgas: { required: true, type: () => Number }, totalWards: { required: true, type: () => Number }, totalPollingUnits: { required: true, type: () => Number }, assignedCoordinators: { required: true, type: () => Number } };
    }
}
exports.CoverageStatsDto = CoverageStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    __metadata("design:type", String)
], CoverageStatsDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jigawa' }),
    __metadata("design:type", String)
], CoverageStatsDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 27 }),
    __metadata("design:type", Number)
], CoverageStatsDto.prototype, "totalLgas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CoverageStatsDto.prototype, "totalWards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CoverageStatsDto.prototype, "totalPollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CoverageStatsDto.prototype, "assignedCoordinators", void 0);
class CampaignListItemDto {
    id;
    name;
    slug;
    stateId;
    isActive;
    state;
    _count;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, stateId: { required: true, type: () => String }, isActive: { required: true, type: () => Boolean }, state: { required: false, type: () => require("./structure-response.dto").StateResponseDto }, _count: { required: false, type: () => require("./structure-response.dto").CountDto } };
    }
}
exports.CampaignListItemDto = CampaignListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CampaignListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jigawa State Campaign 2027' }),
    __metadata("design:type", String)
], CampaignListItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jigawa-2027' }),
    __metadata("design:type", String)
], CampaignListItemDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CampaignListItemDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CampaignListItemDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: StateResponseDto }),
    __metadata("design:type", StateResponseDto)
], CampaignListItemDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CountDto }),
    __metadata("design:type", CountDto)
], CampaignListItemDto.prototype, "_count", void 0);
//# sourceMappingURL=structure-response.dto.js.map