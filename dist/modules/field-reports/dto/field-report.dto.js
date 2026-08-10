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
exports.UpdateFieldReportStatusDto = exports.ListFieldReportsQueryDto = exports.CreateFieldReportDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateFieldReportDto {
    campaignId;
    type;
    title;
    description;
    wardId;
    pollingUnitId;
    latitude;
    longitude;
    isUrgent;
    photoUrls;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, type: { required: true, enum: require("../../../../shared/dist/enums").FieldReportType }, title: { required: true, type: () => String, minLength: 3 }, description: { required: true, type: () => String, minLength: 5 }, wardId: { required: false, type: () => String }, pollingUnitId: { required: false, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, isUrgent: { required: false, type: () => Boolean }, photoUrls: { required: false, type: () => [String] } };
    }
}
exports.CreateFieldReportDto = CreateFieldReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.FieldReportType }),
    (0, class_validator_1.IsEnum)(shared_1.FieldReportType),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Security concern at PU' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Unidentified persons gathering near the polling unit entrance.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldReportDto.prototype, "pollingUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFieldReportDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFieldReportDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFieldReportDto.prototype, "isUrgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'URLs of uploaded photos (e.g. EC8A form images)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateFieldReportDto.prototype, "photoUrls", void 0);
class ListFieldReportsQueryDto {
    campaignId;
    type;
    isUrgent;
    search;
    pollingUnitId;
    reportedById;
    wardId;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, type: { required: false, enum: require("../../../../shared/dist/enums").FieldReportType }, isUrgent: { required: false, type: () => Boolean }, search: { required: false, type: () => String }, pollingUnitId: { required: false, type: () => String }, reportedById: { required: false, type: () => String }, wardId: { required: false, type: () => String }, status: { required: false, enum: require("../../../../shared/dist/enums").FieldReportStatus } };
    }
}
exports.ListFieldReportsQueryDto = ListFieldReportsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.FieldReportType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.FieldReportType),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "type", void 0);
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
], ListFieldReportsQueryDto.prototype, "isUrgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "pollingUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "reportedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.FieldReportStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.FieldReportStatus),
    __metadata("design:type", String)
], ListFieldReportsQueryDto.prototype, "status", void 0);
class UpdateFieldReportStatusDto {
    status;
    wardComment;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, enum: require("../../../../shared/dist/enums").FieldReportStatus }, wardComment: { required: false, type: () => String } };
    }
}
exports.UpdateFieldReportStatusDto = UpdateFieldReportStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.FieldReportStatus }),
    (0, class_validator_1.IsEnum)(shared_1.FieldReportStatus),
    __metadata("design:type", String)
], UpdateFieldReportStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Monitored locally — situation under control' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldReportStatusDto.prototype, "wardComment", void 0);
//# sourceMappingURL=field-report.dto.js.map