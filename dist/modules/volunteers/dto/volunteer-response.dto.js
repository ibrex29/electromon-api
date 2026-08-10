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
exports.VolunteerResponseDto = exports.VolunteerWardDto = exports.VolunteerWardLgaDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class VolunteerWardLgaDto {
    id;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.VolunteerWardLgaDto = VolunteerWardLgaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VolunteerWardLgaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia' }),
    __metadata("design:type", String)
], VolunteerWardLgaDto.prototype, "name", void 0);
class VolunteerWardDto {
    id;
    name;
    lga;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, lga: { required: false, type: () => require("./volunteer-response.dto").VolunteerWardLgaDto, nullable: true } };
    }
}
exports.VolunteerWardDto = VolunteerWardDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VolunteerWardDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Ward A' }),
    __metadata("design:type", String)
], VolunteerWardDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: VolunteerWardLgaDto }),
    __metadata("design:type", Object)
], VolunteerWardDto.prototype, "lga", void 0);
class VolunteerResponseDto {
    id;
    campaignId;
    firstName;
    lastName;
    phoneNumber;
    email;
    wardId;
    ward;
    role;
    performanceScore;
    isVerified;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, campaignId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, email: { required: false, type: () => String, nullable: true }, wardId: { required: false, type: () => String, nullable: true }, ward: { required: false, type: () => require("./volunteer-response.dto").VolunteerWardDto, nullable: true }, role: { required: false, type: () => String, nullable: true }, performanceScore: { required: true, type: () => Number }, isVerified: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.VolunteerResponseDto = VolunteerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VolunteerResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VolunteerResponseDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Amina' }),
    __metadata("design:type", String)
], VolunteerResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yusuf' }),
    __metadata("design:type", String)
], VolunteerResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    __metadata("design:type", String)
], VolunteerResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'amina@example.com' }),
    __metadata("design:type", Object)
], VolunteerResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], VolunteerResponseDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: VolunteerWardDto }),
    __metadata("design:type", Object)
], VolunteerResponseDto.prototype, "ward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CANVASSER' }),
    __metadata("design:type", Object)
], VolunteerResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], VolunteerResponseDto.prototype, "performanceScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], VolunteerResponseDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VolunteerResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VolunteerResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=volunteer-response.dto.js.map