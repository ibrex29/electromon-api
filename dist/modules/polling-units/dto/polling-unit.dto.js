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
exports.ListPollingUnitsQueryDto = exports.UpdatePollingUnitDto = exports.CreatePollingUnitDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const class_validator_1 = require("class-validator");
class CreatePollingUnitDto {
    campaignId;
    code;
    name;
    wardId;
    latitude;
    longitude;
    strengthAssessment;
    status;
    assignedAgentId;
    notes;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, code: { required: true, type: () => String, minLength: 3 }, name: { required: true, type: () => String, minLength: 3 }, wardId: { required: true, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, strengthAssessment: { required: false, enum: require("../../../../shared/dist/enums").PollingUnitStrength }, status: { required: false, enum: require("../../../../shared/dist/enums").PollingUnitStatus }, assignedAgentId: { required: false, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.CreatePollingUnitDto = CreatePollingUnitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JI-HD-002' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Central PU 002' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jigawa ward ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12.4534 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePollingUnitDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10.0411 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePollingUnitDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.PollingUnitStrength }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.PollingUnitStrength),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "strengthAssessment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.PollingUnitStatus, default: shared_1.PollingUnitStatus.ACTIVE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.PollingUnitStatus),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Volunteer ID assigned as polling agent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "assignedAgentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePollingUnitDto.prototype, "notes", void 0);
class UpdatePollingUnitDto extends (0, swagger_1.PartialType)(CreatePollingUnitDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdatePollingUnitDto = UpdatePollingUnitDto;
class ListPollingUnitsQueryDto {
    campaignId;
    lgaId;
    wardId;
    status;
    strength;
    search;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, lgaId: { required: false, type: () => String }, wardId: { required: false, type: () => String }, status: { required: false, enum: require("../../../../shared/dist/enums").PollingUnitStatus }, strength: { required: false, enum: require("../../../../shared/dist/enums").PollingUnitStrength }, search: { required: false, type: () => String } };
    }
}
exports.ListPollingUnitsQueryDto = ListPollingUnitsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.PollingUnitStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.PollingUnitStatus),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.PollingUnitStrength }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.PollingUnitStrength),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "strength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by code or name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPollingUnitsQueryDto.prototype, "search", void 0);
//# sourceMappingURL=polling-unit.dto.js.map