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
exports.PollingUnitResponseDto = exports.AssignedAgentDto = exports.PollingUnitWardDto = exports.PollingUnitWardLgaDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
class PollingUnitWardLgaDto {
    id;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.PollingUnitWardLgaDto = PollingUnitWardLgaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PollingUnitWardLgaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia' }),
    __metadata("design:type", String)
], PollingUnitWardLgaDto.prototype, "name", void 0);
class PollingUnitWardDto {
    id;
    name;
    lga;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, lga: { required: true, type: () => require("./polling-unit-response.dto").PollingUnitWardLgaDto } };
    }
}
exports.PollingUnitWardDto = PollingUnitWardDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PollingUnitWardDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Ward A' }),
    __metadata("design:type", String)
], PollingUnitWardDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PollingUnitWardLgaDto }),
    __metadata("design:type", PollingUnitWardLgaDto)
], PollingUnitWardDto.prototype, "lga", void 0);
class AssignedAgentDto {
    id;
    firstName;
    lastName;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String } };
    }
}
exports.AssignedAgentDto = AssignedAgentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Amina' }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yusuf' }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "lastName", void 0);
class PollingUnitResponseDto {
    id;
    code;
    name;
    wardId;
    ward;
    latitude;
    longitude;
    strengthAssessment;
    status;
    assignedAgentId;
    assignedAgent;
    notes;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, code: { required: true, type: () => String }, name: { required: true, type: () => String }, wardId: { required: true, type: () => String }, ward: { required: true, type: () => require("./polling-unit-response.dto").PollingUnitWardDto }, latitude: { required: false, type: () => Number, nullable: true }, longitude: { required: false, type: () => Number, nullable: true }, strengthAssessment: { required: false, nullable: true, enum: require("../../../../shared/dist/enums").PollingUnitStrength }, status: { required: true, enum: require("../../../../shared/dist/enums").PollingUnitStatus }, assignedAgentId: { required: false, type: () => String, nullable: true }, assignedAgent: { required: false, type: () => require("./polling-unit-response.dto").AssignedAgentDto, nullable: true }, notes: { required: false, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
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
    (0, swagger_1.ApiProperty)({ type: PollingUnitWardDto }),
    __metadata("design:type", PollingUnitWardDto)
], PollingUnitResponseDto.prototype, "ward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12.4534 }),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10.0411 }),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.PollingUnitStrength }),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "strengthAssessment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.PollingUnitStatus }),
    __metadata("design:type", String)
], PollingUnitResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "assignedAgentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: AssignedAgentDto }),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "assignedAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], PollingUnitResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PollingUnitResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PollingUnitResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=polling-unit-response.dto.js.map