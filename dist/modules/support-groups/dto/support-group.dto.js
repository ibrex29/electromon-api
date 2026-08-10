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
exports.ListSupportGroupsQueryDto = exports.UpdateSupportGroupDto = exports.CreateSupportGroupDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const shared_1 = require("@electromon/shared");
class CreateSupportGroupDto {
    campaignId;
    name;
    category;
    leaderName;
    leaderPhone;
    leaderEmail;
    memberCount;
    lgaId;
    areaOfOperation;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, name: { required: true, type: () => String, minLength: 2 }, category: { required: true, enum: require("../../../../shared/dist/enums").SupportGroupCategory }, leaderName: { required: true, type: () => String, minLength: 2 }, leaderPhone: { required: true, type: () => String, minLength: 7 }, leaderEmail: { required: false, type: () => String, format: "email" }, memberCount: { required: false, type: () => Number, minimum: 0 }, lgaId: { required: false, type: () => String }, areaOfOperation: { required: false, type: () => String } };
    }
}
exports.CreateSupportGroupDto = CreateSupportGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Youth Forum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.SupportGroupCategory, example: shared_1.SupportGroupCategory.YOUTH }),
    (0, class_validator_1.IsEnum)(shared_1.SupportGroupCategory),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ibrahim Musa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "leaderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(7),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "leaderPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'leader@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "leaderEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 120, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSupportGroupDto.prototype, "memberCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Jigawa LGA ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hadejia town and surrounds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupportGroupDto.prototype, "areaOfOperation", void 0);
class UpdateSupportGroupDto extends (0, swagger_1.PartialType)(CreateSupportGroupDto) {
    verificationStatus;
    static _OPENAPI_METADATA_FACTORY() {
        return { verificationStatus: { required: false, enum: require("../../../../shared/dist/enums").VerificationStatus } };
    }
}
exports.UpdateSupportGroupDto = UpdateSupportGroupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.VerificationStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.VerificationStatus),
    __metadata("design:type", String)
], UpdateSupportGroupDto.prototype, "verificationStatus", void 0);
class ListSupportGroupsQueryDto {
    campaignId;
    category;
    verificationStatus;
    lgaId;
    search;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, category: { required: false, enum: require("../../../../shared/dist/enums").SupportGroupCategory }, verificationStatus: { required: false, enum: require("../../../../shared/dist/enums").VerificationStatus }, lgaId: { required: false, type: () => String }, search: { required: false, type: () => String } };
    }
}
exports.ListSupportGroupsQueryDto = ListSupportGroupsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListSupportGroupsQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.SupportGroupCategory }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SupportGroupCategory),
    __metadata("design:type", String)
], ListSupportGroupsQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.VerificationStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.VerificationStatus),
    __metadata("design:type", String)
], ListSupportGroupsQueryDto.prototype, "verificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListSupportGroupsQueryDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by name or leader' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListSupportGroupsQueryDto.prototype, "search", void 0);
//# sourceMappingURL=support-group.dto.js.map