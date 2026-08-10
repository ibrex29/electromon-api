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
exports.SituationSummaryQueryDto = exports.ListSituationUpdatesQueryDto = exports.UpdateSituationUpdateDto = exports.CreateSituationUpdateDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateSituationUpdateDto {
    campaignId;
    pollingUnitId;
    status;
    notes;
    latitude;
    longitude;
    isUrgent;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, pollingUnitId: { required: true, type: () => String }, status: { required: true, enum: require("../../../../shared/dist/enums").SituationStatus }, notes: { required: false, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, isUrgent: { required: false, type: () => Boolean } };
    }
}
exports.CreateSituationUpdateDto = CreateSituationUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSituationUpdateDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSituationUpdateDto.prototype, "pollingUnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.SituationStatus }),
    (0, class_validator_1.IsEnum)(shared_1.SituationStatus),
    __metadata("design:type", String)
], CreateSituationUpdateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSituationUpdateDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSituationUpdateDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSituationUpdateDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSituationUpdateDto.prototype, "isUrgent", void 0);
class UpdateSituationUpdateDto extends (0, swagger_1.PartialType)(CreateSituationUpdateDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateSituationUpdateDto = UpdateSituationUpdateDto;
class ListSituationUpdatesQueryDto {
    campaignId;
    status;
    pollingUnitId;
    reportedById;
    isUrgent;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, status: { required: false, enum: require("../../../../shared/dist/enums").SituationStatus }, pollingUnitId: { required: false, type: () => String }, reportedById: { required: false, type: () => String }, isUrgent: { required: false, type: () => Boolean } };
    }
}
exports.ListSituationUpdatesQueryDto = ListSituationUpdatesQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListSituationUpdatesQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.SituationStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SituationStatus),
    __metadata("design:type", String)
], ListSituationUpdatesQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListSituationUpdatesQueryDto.prototype, "pollingUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListSituationUpdatesQueryDto.prototype, "reportedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListSituationUpdatesQueryDto.prototype, "isUrgent", void 0);
class SituationSummaryQueryDto {
    campaignId;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String } };
    }
}
exports.SituationSummaryQueryDto = SituationSummaryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SituationSummaryQueryDto.prototype, "campaignId", void 0);
//# sourceMappingURL=situation-update.dto.js.map