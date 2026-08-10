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
exports.ListCommitmentsQueryDto = exports.UpdateCommitmentDto = exports.CreateCommitmentDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const db_1 = require("@electromon/db");
const class_validator_1 = require("class-validator");
class CreateCommitmentDto {
    campaignId;
    supportGroupId;
    title;
    description;
    targetValue;
    currentValue;
    deadline;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, supportGroupId: { required: true, type: () => String }, title: { required: true, type: () => String, minLength: 3 }, description: { required: false, type: () => String }, targetValue: { required: true, type: () => Number, minimum: 1 }, currentValue: { required: false, type: () => Number, minimum: 0 }, deadline: { required: true, type: () => String }, status: { required: false, enum: ["ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"] } };
    }
}
exports.CreateCommitmentDto = CreateCommitmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "supportGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mobilize 500 youth voters in Hadejia' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Door-to-door outreach before registration deadline' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCommitmentDto.prototype, "targetValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommitmentDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-31' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: db_1.CommitmentStatus, default: db_1.CommitmentStatus.DRAFT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(db_1.CommitmentStatus),
    __metadata("design:type", String)
], CreateCommitmentDto.prototype, "status", void 0);
class UpdateCommitmentDto extends (0, swagger_1.PartialType)(CreateCommitmentDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateCommitmentDto = UpdateCommitmentDto;
class ListCommitmentsQueryDto {
    campaignId;
    status;
    supportGroupId;
    search;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, status: { required: false, enum: ["ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"] }, supportGroupId: { required: false, type: () => String }, search: { required: false, type: () => String } };
    }
}
exports.ListCommitmentsQueryDto = ListCommitmentsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListCommitmentsQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: db_1.CommitmentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(db_1.CommitmentStatus),
    __metadata("design:type", String)
], ListCommitmentsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCommitmentsQueryDto.prototype, "supportGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by title or description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCommitmentsQueryDto.prototype, "search", void 0);
//# sourceMappingURL=commitment.dto.js.map