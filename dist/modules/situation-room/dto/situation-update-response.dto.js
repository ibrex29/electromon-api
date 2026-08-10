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
exports.SituationSummaryDto = exports.SituationUpdateResponseDto = exports.SituationReporterDto = exports.SituationPollingUnitDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@electromon/shared");
class SituationPollingUnitDto {
    id;
    code;
    name;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, code: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.SituationPollingUnitDto = SituationPollingUnitDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationPollingUnitDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JI-HD-001' }),
    __metadata("design:type", String)
], SituationPollingUnitDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hadejia Central PU 001' }),
    __metadata("design:type", String)
], SituationPollingUnitDto.prototype, "name", void 0);
class SituationReporterDto {
    id;
    firstName;
    lastName;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String } };
    }
}
exports.SituationReporterDto = SituationReporterDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationReporterDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Campaign' }),
    __metadata("design:type", String)
], SituationReporterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Director' }),
    __metadata("design:type", String)
], SituationReporterDto.prototype, "lastName", void 0);
class SituationUpdateResponseDto {
    id;
    pollingUnitId;
    pollingUnit;
    reportedById;
    reporter;
    status;
    notes;
    latitude;
    longitude;
    isUrgent;
    createdAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, pollingUnitId: { required: true, type: () => String }, pollingUnit: { required: true, type: () => require("./situation-update-response.dto").SituationPollingUnitDto }, reportedById: { required: true, type: () => String }, reporter: { required: true, type: () => require("./situation-update-response.dto").SituationReporterDto }, status: { required: true, enum: require("../../../../shared/dist/enums").SituationStatus }, notes: { required: false, type: () => String, nullable: true }, latitude: { required: false, type: () => Number, nullable: true }, longitude: { required: false, type: () => Number, nullable: true }, isUrgent: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date } };
    }
}
exports.SituationUpdateResponseDto = SituationUpdateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationUpdateResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationUpdateResponseDto.prototype, "pollingUnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SituationPollingUnitDto }),
    __metadata("design:type", SituationPollingUnitDto)
], SituationUpdateResponseDto.prototype, "pollingUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationUpdateResponseDto.prototype, "reportedById", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SituationReporterDto }),
    __metadata("design:type", SituationReporterDto)
], SituationUpdateResponseDto.prototype, "reporter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_1.SituationStatus }),
    __metadata("design:type", String)
], SituationUpdateResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SituationUpdateResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SituationUpdateResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], SituationUpdateResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SituationUpdateResponseDto.prototype, "isUrgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SituationUpdateResponseDto.prototype, "createdAt", void 0);
class SituationSummaryDto {
    campaignId;
    totalUpdates;
    open;
    reporting;
    closed;
    incidents;
    urgent;
    totalPollingUnits;
    unitsWithUpdates;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, totalUpdates: { required: true, type: () => Number }, open: { required: true, type: () => Number }, reporting: { required: true, type: () => Number }, closed: { required: true, type: () => Number }, incidents: { required: true, type: () => Number }, urgent: { required: true, type: () => Number }, totalPollingUnits: { required: true, type: () => Number }, unitsWithUpdates: { required: true, type: () => Number } };
    }
}
exports.SituationSummaryDto = SituationSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SituationSummaryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "totalUpdates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "open", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "reporting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "closed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "incidents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "urgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "totalPollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], SituationSummaryDto.prototype, "unitsWithUpdates", void 0);
//# sourceMappingURL=situation-update-response.dto.js.map