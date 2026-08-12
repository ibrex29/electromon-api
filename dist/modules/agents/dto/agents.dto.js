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
exports.AgentResponseDto = exports.UpdateAgentDto = exports.CreateAgentDto = exports.ListAgentsQueryDto = exports.MANAGEABLE_AGENT_ROLES = exports.PU_AGENT_ROLE = exports.WARD_AGENT_ROLE = void 0;
const openapi = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.WARD_AGENT_ROLE = shared_1.CampaignRole.WARD_RA_OFFICER;
exports.PU_AGENT_ROLE = shared_1.CampaignRole.POLLING_AGENT;
exports.MANAGEABLE_AGENT_ROLES = [exports.WARD_AGENT_ROLE, exports.PU_AGENT_ROLE];
class ListAgentsQueryDto {
    campaignId;
    kind;
    lgaId;
    wardId;
    search;
    includeInactive;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, kind: { required: false, enum: ["ward", "pu", "all"] }, lgaId: { required: false, type: () => String }, wardId: { required: false, type: () => String }, search: { required: false, type: () => String }, includeInactive: { required: false, type: () => Boolean } };
    }
}
exports.ListAgentsQueryDto = ListAgentsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListAgentsQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ward', 'pu', 'all'], default: 'all' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAgentsQueryDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Override LGA (director/state only; LGA users locked to scope)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAgentsQueryDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAgentsQueryDto.prototype, "wardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAgentsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListAgentsQueryDto.prototype, "includeInactive", void 0);
class CreateAgentDto {
    campaignId;
    role;
    scopeId;
    firstName;
    lastName;
    phoneNumber;
    email;
    password;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, role: { required: true, type: () => Object }, scopeId: { required: true, type: () => String }, firstName: { required: true, type: () => String, minLength: 2 }, lastName: { required: true, type: () => String, minLength: 2 }, phoneNumber: { required: true, type: () => String }, email: { required: false, type: () => String, format: "email" }, password: { required: true, type: () => String, minLength: 8 } };
    }
}
exports.CreateAgentDto = CreateAgentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.MANAGEABLE_AGENT_ROLES }),
    (0, class_validator_1.IsEnum)(shared_1.CampaignRole),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ward id (ward agent) or polling unit id (PU agent)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional; auto-generated from phone if omitted' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreateAgentDto.prototype, "password", void 0);
class UpdateAgentDto {
    firstName;
    lastName;
    phoneNumber;
    email;
    role;
    scopeId;
    isActive;
    password;
    static _OPENAPI_METADATA_FACTORY() {
        return { firstName: { required: false, type: () => String, minLength: 2 }, lastName: { required: false, type: () => String, minLength: 2 }, phoneNumber: { required: false, type: () => String }, email: { required: false, type: () => String, format: "email" }, role: { required: false, type: () => Object }, scopeId: { required: false, type: () => String }, isActive: { required: false, type: () => Boolean }, password: { required: false, type: () => String, minLength: 8 } };
    }
}
exports.UpdateAgentDto = UpdateAgentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: exports.MANAGEABLE_AGENT_ROLES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.CampaignRole),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ward or polling unit id matching the role' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAgentDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 8, description: 'Reset login password' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], UpdateAgentDto.prototype, "password", void 0);
class AgentResponseDto {
    membershipId;
    userId;
    firstName;
    lastName;
    phoneNumber;
    email;
    role;
    scopeType;
    scopeId;
    scopeName;
    wardName;
    lgaName;
    isActive;
    userActive;
    createdAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { membershipId: { required: true, type: () => String }, userId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String }, role: { required: true, enum: require("../../../../shared/dist/enums").CampaignRole }, scopeType: { required: true, enum: require("../../../../shared/dist/enums").ScopeType }, scopeId: { required: true, type: () => String }, scopeName: { required: true, type: () => String }, wardName: { required: false, type: () => String, nullable: true }, lgaName: { required: false, type: () => String, nullable: true }, isActive: { required: true, type: () => Boolean }, userActive: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date } };
    }
}
exports.AgentResponseDto = AgentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "membershipId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AgentResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.CampaignRole }),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.ScopeType }),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "scopeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AgentResponseDto.prototype, "scopeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AgentResponseDto.prototype, "wardName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AgentResponseDto.prototype, "lgaName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AgentResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AgentResponseDto.prototype, "userActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AgentResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=agents.dto.js.map