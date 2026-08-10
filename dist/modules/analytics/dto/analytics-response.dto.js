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
exports.AnalyticsOverviewDto = exports.LgaCoverageDto = exports.RecentActivityDto = exports.TopVolunteerDto = exports.PuBreakdownDto = exports.CommitmentProgressDto = exports.AnalyticsCountsDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class AnalyticsCountsDto {
    supportGroups;
    activeSupportGroups;
    volunteers;
    verifiedVolunteers;
    commitments;
    activeCommitments;
    completedCommitments;
    pollingUnits;
    assignedPollingUnits;
    fieldReports;
    urgentFieldReports;
    situationUpdates;
    urgentSituations;
    incidents;
    static _OPENAPI_METADATA_FACTORY() {
        return { supportGroups: { required: true, type: () => Number }, activeSupportGroups: { required: true, type: () => Number }, volunteers: { required: true, type: () => Number }, verifiedVolunteers: { required: true, type: () => Number }, commitments: { required: true, type: () => Number }, activeCommitments: { required: true, type: () => Number }, completedCommitments: { required: true, type: () => Number }, pollingUnits: { required: true, type: () => Number }, assignedPollingUnits: { required: true, type: () => Number }, fieldReports: { required: true, type: () => Number }, urgentFieldReports: { required: true, type: () => Number }, situationUpdates: { required: true, type: () => Number }, urgentSituations: { required: true, type: () => Number }, incidents: { required: true, type: () => Number } };
    }
}
exports.AnalyticsCountsDto = AnalyticsCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "supportGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "activeSupportGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "volunteers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "verifiedVolunteers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "commitments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "activeCommitments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "completedCommitments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "pollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "assignedPollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "fieldReports", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "urgentFieldReports", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "situationUpdates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "urgentSituations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AnalyticsCountsDto.prototype, "incidents", void 0);
class CommitmentProgressDto {
    totalTarget;
    totalCurrent;
    percent;
    static _OPENAPI_METADATA_FACTORY() {
        return { totalTarget: { required: true, type: () => Number }, totalCurrent: { required: true, type: () => Number }, percent: { required: true, type: () => Number } };
    }
}
exports.CommitmentProgressDto = CommitmentProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommitmentProgressDto.prototype, "totalTarget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommitmentProgressDto.prototype, "totalCurrent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommitmentProgressDto.prototype, "percent", void 0);
class PuBreakdownDto {
    strong;
    swing;
    weak;
    unassessed;
    static _OPENAPI_METADATA_FACTORY() {
        return { strong: { required: true, type: () => Number }, swing: { required: true, type: () => Number }, weak: { required: true, type: () => Number }, unassessed: { required: true, type: () => Number } };
    }
}
exports.PuBreakdownDto = PuBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PuBreakdownDto.prototype, "strong", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PuBreakdownDto.prototype, "swing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PuBreakdownDto.prototype, "weak", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PuBreakdownDto.prototype, "unassessed", void 0);
class TopVolunteerDto {
    id;
    firstName;
    lastName;
    role;
    performanceScore;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, role: { required: false, type: () => String, nullable: true }, performanceScore: { required: true, type: () => Number } };
    }
}
exports.TopVolunteerDto = TopVolunteerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TopVolunteerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TopVolunteerDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TopVolunteerDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], TopVolunteerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TopVolunteerDto.prototype, "performanceScore", void 0);
class RecentActivityDto {
    type;
    id;
    title;
    subtitle;
    isUrgent;
    createdAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => String }, id: { required: true, type: () => String }, title: { required: true, type: () => String }, subtitle: { required: false, type: () => String }, isUrgent: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date } };
    }
}
exports.RecentActivityDto = RecentActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['field_report', 'situation_update', 'commitment'] }),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], RecentActivityDto.prototype, "isUrgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RecentActivityDto.prototype, "createdAt", void 0);
class LgaCoverageDto {
    lgaId;
    lgaName;
    pollingUnits;
    assignedAgents;
    volunteers;
    static _OPENAPI_METADATA_FACTORY() {
        return { lgaId: { required: true, type: () => String }, lgaName: { required: true, type: () => String }, pollingUnits: { required: true, type: () => Number }, assignedAgents: { required: true, type: () => Number }, volunteers: { required: true, type: () => Number } };
    }
}
exports.LgaCoverageDto = LgaCoverageDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LgaCoverageDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LgaCoverageDto.prototype, "lgaName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LgaCoverageDto.prototype, "pollingUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LgaCoverageDto.prototype, "assignedAgents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LgaCoverageDto.prototype, "volunteers", void 0);
class AnalyticsOverviewDto {
    campaignId;
    state;
    counts;
    commitmentProgress;
    pollingUnitStrength;
    topVolunteers;
    recentActivity;
    lgaCoverage;
    static _OPENAPI_METADATA_FACTORY() {
        return { campaignId: { required: true, type: () => String }, state: { required: true, type: () => String }, counts: { required: true, type: () => require("./analytics-response.dto").AnalyticsCountsDto }, commitmentProgress: { required: true, type: () => require("./analytics-response.dto").CommitmentProgressDto }, pollingUnitStrength: { required: true, type: () => require("./analytics-response.dto").PuBreakdownDto }, topVolunteers: { required: true, type: () => [require("./analytics-response.dto").TopVolunteerDto] }, recentActivity: { required: true, type: () => [require("./analytics-response.dto").RecentActivityDto] }, lgaCoverage: { required: true, type: () => [require("./analytics-response.dto").LgaCoverageDto] } };
    }
}
exports.AnalyticsOverviewDto = AnalyticsOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AnalyticsOverviewDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AnalyticsOverviewDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AnalyticsCountsDto }),
    __metadata("design:type", AnalyticsCountsDto)
], AnalyticsOverviewDto.prototype, "counts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CommitmentProgressDto }),
    __metadata("design:type", CommitmentProgressDto)
], AnalyticsOverviewDto.prototype, "commitmentProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PuBreakdownDto }),
    __metadata("design:type", PuBreakdownDto)
], AnalyticsOverviewDto.prototype, "pollingUnitStrength", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TopVolunteerDto] }),
    __metadata("design:type", Array)
], AnalyticsOverviewDto.prototype, "topVolunteers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecentActivityDto] }),
    __metadata("design:type", Array)
], AnalyticsOverviewDto.prototype, "recentActivity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LgaCoverageDto] }),
    __metadata("design:type", Array)
], AnalyticsOverviewDto.prototype, "lgaCoverage", void 0);
//# sourceMappingURL=analytics-response.dto.js.map