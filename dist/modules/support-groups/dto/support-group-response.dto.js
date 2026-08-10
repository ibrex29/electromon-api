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
exports.SupportGroupResponseDto = exports.SupportGroupLgaDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
class SupportGroupLgaDto {
    id;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.SupportGroupLgaDto = SupportGroupLgaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SupportGroupLgaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia' }),
    __metadata("design:type", String)
], SupportGroupLgaDto.prototype, "name", void 0);
class SupportGroupResponseDto {
    id;
    campaignId;
    name;
    category;
    leaderName;
    leaderPhone;
    leaderEmail;
    memberCount;
    lgaId;
    lga;
    areaOfOperation;
    verificationStatus;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, campaignId: { required: true, type: () => String }, name: { required: true, type: () => String }, category: { required: true, enum: require("../../../../shared/dist/enums").SupportGroupCategory }, leaderName: { required: true, type: () => String }, leaderPhone: { required: true, type: () => String }, leaderEmail: { required: false, type: () => String, nullable: true }, memberCount: { required: true, type: () => Number }, lgaId: { required: false, type: () => String, nullable: true }, lga: { required: false, type: () => require("./support-group-response.dto").SupportGroupLgaDto, nullable: true }, areaOfOperation: { required: false, type: () => String, nullable: true }, verificationStatus: { required: true, enum: require("../../../../shared/dist/enums").VerificationStatus }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.SupportGroupResponseDto = SupportGroupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Youth Forum' }),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.SupportGroupCategory }),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ibrahim Musa' }),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "leaderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "leaderPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'leader@example.com' }),
    __metadata("design:type", Object)
], SupportGroupResponseDto.prototype, "leaderEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], SupportGroupResponseDto.prototype, "memberCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SupportGroupResponseDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: SupportGroupLgaDto }),
    __metadata("design:type", Object)
], SupportGroupResponseDto.prototype, "lga", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hadejia town and surrounds' }),
    __metadata("design:type", Object)
], SupportGroupResponseDto.prototype, "areaOfOperation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.VerificationStatus }),
    __metadata("design:type", String)
], SupportGroupResponseDto.prototype, "verificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SupportGroupResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SupportGroupResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=support-group-response.dto.js.map