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
exports.CommitmentResponseDto = exports.CommitmentSupportGroupDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const db_1 = require("@electromon/db");
class CommitmentSupportGroupDto {
    id;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.CommitmentSupportGroupDto = CommitmentSupportGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommitmentSupportGroupDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Youth Forum' }),
    __metadata("design:type", String)
], CommitmentSupportGroupDto.prototype, "name", void 0);
class CommitmentResponseDto {
    id;
    campaignId;
    supportGroupId;
    supportGroup;
    title;
    description;
    targetValue;
    currentValue;
    deadline;
    status;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, campaignId: { required: true, type: () => String }, supportGroupId: { required: true, type: () => String }, supportGroup: { required: true, type: () => require("./commitment-response.dto").CommitmentSupportGroupDto }, title: { required: true, type: () => String }, description: { required: false, type: () => String, nullable: true }, targetValue: { required: true, type: () => Number }, currentValue: { required: true, type: () => Number }, deadline: { required: true, type: () => Date }, status: { required: true, enum: ["ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"] }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.CommitmentResponseDto = CommitmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommitmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommitmentResponseDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommitmentResponseDto.prototype, "supportGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CommitmentSupportGroupDto }),
    __metadata("design:type", CommitmentSupportGroupDto)
], CommitmentResponseDto.prototype, "supportGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mobilize 500 youth voters in Hadejia' }),
    __metadata("design:type", String)
], CommitmentResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], CommitmentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500 }),
    __metadata("design:type", Number)
], CommitmentResponseDto.prototype, "targetValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], CommitmentResponseDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommitmentResponseDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: db_1.CommitmentStatus }),
    __metadata("design:type", String)
], CommitmentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommitmentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommitmentResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=commitment-response.dto.js.map