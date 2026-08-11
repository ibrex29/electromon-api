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
exports.SessionResponseDto = exports.CampaignMembershipDto = exports.RegisterResponseDto = exports.RefreshTokenResponseDto = exports.LoginResponseDto = exports.AuthUserDto = exports.CollationDashboardDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
class CollationDashboardDto {
    level;
    levelLabel;
    levelOrder;
    scopeType;
    scopeId;
    scopeName;
    canSubmit;
    canApprove;
    approvesFromLevel;
    submitsToLevel;
    route;
    static _OPENAPI_METADATA_FACTORY() {
        return { level: { required: true, enum: require("../../../../shared/dist/collation").CollationLevel }, levelLabel: { required: true, type: () => String }, levelOrder: { required: true, type: () => Number }, scopeType: { required: true, enum: require("../../../../shared/dist/enums").ScopeType }, scopeId: { required: false, type: () => String }, scopeName: { required: false, type: () => String }, canSubmit: { required: true, type: () => Boolean }, canApprove: { required: true, type: () => Boolean }, approvesFromLevel: { required: false, type: () => String, enum: require("../../../../shared/dist/collation").CollationLevel }, submitsToLevel: { required: false, type: () => String, enum: require("../../../../shared/dist/collation").CollationLevel }, route: { required: true, type: () => String } };
    }
}
exports.CollationDashboardDto = CollationDashboardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'POLLING_UNIT' }),
    __metadata("design:type", Object)
], CollationDashboardDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Polling Unit (PU)' }),
    __metadata("design:type", String)
], CollationDashboardDto.prototype, "levelLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CollationDashboardDto.prototype, "levelOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.ScopeType, example: shared_1.ScopeType.POLLING_UNIT }),
    __metadata("design:type", String)
], CollationDashboardDto.prototype, "scopeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cms147za8001xww9ktd46y7m0' }),
    __metadata("design:type", String)
], CollationDashboardDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hadejia Central PU 001 (JI-HD-001)' }),
    __metadata("design:type", String)
], CollationDashboardDto.prototype, "scopeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CollationDashboardDto.prototype, "canSubmit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], CollationDashboardDto.prototype, "canApprove", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WARD' }),
    __metadata("design:type", Object)
], CollationDashboardDto.prototype, "approvesFromLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WARD' }),
    __metadata("design:type", Object)
], CollationDashboardDto.prototype, "submitsToLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/dashboard/polling-unit' }),
    __metadata("design:type", String)
], CollationDashboardDto.prototype, "route", void 0);
class AuthUserDto {
    id;
    email;
    phoneNumber;
    firstName;
    lastName;
    role;
    scopeType;
    scopeId;
    campaignId;
    mfaEnabled;
    dashboard;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String }, phoneNumber: { required: false, type: () => String, nullable: true }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, role: { required: false, enum: require("../../../../shared/dist/enums").CampaignRole }, scopeType: { required: false, enum: require("../../../../shared/dist/enums").ScopeType }, scopeId: { required: false, type: () => String }, campaignId: { required: false, type: () => String }, mfaEnabled: { required: true, type: () => Boolean }, dashboard: { required: false, type: () => require("./auth-response.dto").CollationDashboardDto } };
    }
}
exports.AuthUserDto = AuthUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147za8001xww9ktd46y7m0' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'director@electromon.ng' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+2348000000001' }),
    __metadata("design:type", Object)
], AuthUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Campaign' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Director' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.CampaignRole, example: shared_1.CampaignRole.CAMPAIGN_DIRECTOR }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.ScopeType, example: shared_1.ScopeType.CAMPAIGN }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "scopeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cms147z3t001www9ktkqgluw0' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cms147z3t001www9ktkqgluw0' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], AuthUserDto.prototype, "mfaEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CollationDashboardDto }),
    __metadata("design:type", CollationDashboardDto)
], AuthUserDto.prototype, "dashboard", void 0);
class LoginResponseDto {
    user;
    accessToken;
    refreshToken;
    static _OPENAPI_METADATA_FACTORY() {
        return { user: { required: true, type: () => require("./auth-response.dto").AuthUserDto }, accessToken: { required: true, type: () => String }, refreshToken: { required: true, type: () => String } };
    }
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: AuthUserDto }),
    __metadata("design:type", AuthUserDto)
], LoginResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token (15 min expiry)',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8074ffa26b5199ff401b29bad6ce4061cc5c49892821435df994085521c324c8351a17183072c0b46ec6323a0e9f9251',
        description: 'Refresh token (7 day expiry)',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "refreshToken", void 0);
class RefreshTokenResponseDto {
    accessToken;
    refreshToken;
    static _OPENAPI_METADATA_FACTORY() {
        return { accessToken: { required: true, type: () => String }, refreshToken: { required: true, type: () => String } };
    }
}
exports.RefreshTokenResponseDto = RefreshTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "refreshToken", void 0);
class RegisterResponseDto {
    id;
    email;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String } };
    }
}
exports.RegisterResponseDto = RegisterResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147za8001xww9ktd46y7m0' }),
    __metadata("design:type", String)
], RegisterResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], RegisterResponseDto.prototype, "email", void 0);
class CampaignMembershipDto {
    campaignId;
    campaignName;
    role;
    scopeType;
    scopeId;
    scopeName;
    dashboard;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, campaignName: { required: true, type: () => String }, role: { required: true, enum: require("../../../../shared/dist/enums").CampaignRole }, scopeType: { required: false, enum: require("../../../../shared/dist/enums").ScopeType }, scopeId: { required: false, type: () => String }, scopeName: { required: false, type: () => String }, dashboard: { required: false, type: () => require("./auth-response.dto").CollationDashboardDto } };
    }
}
exports.CampaignMembershipDto = CampaignMembershipDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147z3t001www9ktkqgluw0' }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jigawa State Campaign 2027' }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "campaignName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.CampaignRole, example: shared_1.CampaignRole.CAMPAIGN_DIRECTOR }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_1.ScopeType, example: shared_1.ScopeType.CAMPAIGN }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "scopeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cms147z3t001www9ktkqgluw0' }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hadejia Ward A' }),
    __metadata("design:type", String)
], CampaignMembershipDto.prototype, "scopeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CollationDashboardDto }),
    __metadata("design:type", CollationDashboardDto)
], CampaignMembershipDto.prototype, "dashboard", void 0);
class SessionResponseDto {
    id;
    email;
    firstName;
    lastName;
    mfaEnabled;
    memberships;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, mfaEnabled: { required: true, type: () => Boolean }, memberships: { required: true, type: () => [require("./auth-response.dto").CampaignMembershipDto] } };
    }
}
exports.SessionResponseDto = SessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cms147za8001xww9ktd46y7m0' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'director@electromon.ng' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Campaign' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Director' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], SessionResponseDto.prototype, "mfaEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CampaignMembershipDto] }),
    __metadata("design:type", Array)
], SessionResponseDto.prototype, "memberships", void 0);
//# sourceMappingURL=auth-response.dto.js.map