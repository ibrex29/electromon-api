"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFA_REQUIRED_ROLES = exports.SituationStatus = exports.PollingUnitStatus = exports.PollingUnitStrength = exports.FieldReportStatus = exports.IncidentSeverity = exports.IncidentType = exports.FieldReportType = exports.VerificationStatus = exports.SupportGroupCategory = exports.ScopeType = exports.LEVEL_ROLES = exports.CampaignRole = void 0;
exports.isIncidentSeverityUrgent = isIncidentSeverityUrgent;
var CampaignRole;
(function (CampaignRole) {
    CampaignRole["CANDIDATE"] = "CANDIDATE";
    CampaignRole["CAMPAIGN_DIRECTOR"] = "CAMPAIGN_DIRECTOR";
    /** @deprecated Use STATE_COLLATION_OFFICER — kept for existing DB rows */
    CampaignRole["STATE_COORDINATOR"] = "STATE_COORDINATOR";
    /** @deprecated Use LGA_COLLATION_OFFICER — kept for existing DB rows */
    CampaignRole["LGA_COORDINATOR"] = "LGA_COORDINATOR";
    /** @deprecated Use WARD_RA_OFFICER — kept for existing DB rows */
    CampaignRole["WARD_COORDINATOR"] = "WARD_COORDINATOR";
    CampaignRole["SUPPORT_GROUP_LEADER"] = "SUPPORT_GROUP_LEADER";
    CampaignRole["VOLUNTEER_COORDINATOR"] = "VOLUNTEER_COORDINATOR";
    CampaignRole["POLLING_AGENT_COORDINATOR"] = "POLLING_AGENT_COORDINATOR";
    CampaignRole["DATA_ANALYST"] = "DATA_ANALYST";
    CampaignRole["MEDIA_TEAM"] = "MEDIA_TEAM";
    CampaignRole["POLLING_AGENT"] = "POLLING_AGENT";
    CampaignRole["VOLUNTEER"] = "VOLUNTEER";
    /** @deprecated Use POLLING_AGENT — kept for existing DB rows */
    CampaignRole["POLLING_UNIT_OFFICER"] = "POLLING_UNIT_OFFICER";
    CampaignRole["WARD_RA_OFFICER"] = "WARD_RA_OFFICER";
    CampaignRole["LGA_COLLATION_OFFICER"] = "LGA_COLLATION_OFFICER";
    CampaignRole["STATE_COLLATION_OFFICER"] = "STATE_COLLATION_OFFICER";
    CampaignRole["NATIONAL_COLLATION_OFFICER"] = "NATIONAL_COLLATION_OFFICER";
})(CampaignRole || (exports.CampaignRole = CampaignRole = {}));
/** Canonical collation hierarchy — one role per level */
exports.LEVEL_ROLES = {
    POLLING_UNIT: CampaignRole.POLLING_AGENT,
    WARD: CampaignRole.WARD_RA_OFFICER,
    LGA: CampaignRole.LGA_COLLATION_OFFICER,
    STATE: CampaignRole.STATE_COLLATION_OFFICER,
    NATIONAL: CampaignRole.NATIONAL_COLLATION_OFFICER,
};
var ScopeType;
(function (ScopeType) {
    ScopeType["STATE"] = "STATE";
    ScopeType["SENATORIAL_DISTRICT"] = "SENATORIAL_DISTRICT";
    ScopeType["LGA"] = "LGA";
    ScopeType["WARD"] = "WARD";
    ScopeType["POLLING_UNIT"] = "POLLING_UNIT";
    ScopeType["CAMPAIGN"] = "CAMPAIGN";
    ScopeType["NATIONAL"] = "NATIONAL";
})(ScopeType || (exports.ScopeType = ScopeType = {}));
var SupportGroupCategory;
(function (SupportGroupCategory) {
    SupportGroupCategory["YOUTH"] = "YOUTH";
    SupportGroupCategory["WOMEN"] = "WOMEN";
    SupportGroupCategory["FARMERS"] = "FARMERS";
    SupportGroupCategory["PROFESSIONALS"] = "PROFESSIONALS";
    SupportGroupCategory["STUDENTS"] = "STUDENTS";
    SupportGroupCategory["RELIGIOUS"] = "RELIGIOUS";
    SupportGroupCategory["COMMUNITY"] = "COMMUNITY";
})(SupportGroupCategory || (exports.SupportGroupCategory = SupportGroupCategory = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["ACTIVE"] = "ACTIVE";
    VerificationStatus["REJECTED"] = "REJECTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var FieldReportType;
(function (FieldReportType) {
    FieldReportType["SECURITY_CONCERN"] = "SECURITY_CONCERN";
    FieldReportType["COMMUNITY_REQUEST"] = "COMMUNITY_REQUEST";
    FieldReportType["OPPOSITION_ACTIVITY"] = "OPPOSITION_ACTIVITY";
    FieldReportType["CAMPAIGN_PROGRESS"] = "CAMPAIGN_PROGRESS";
    FieldReportType["DAILY_SITREP"] = "DAILY_SITREP";
    FieldReportType["INCIDENT"] = "INCIDENT";
})(FieldReportType || (exports.FieldReportType = FieldReportType = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["VOTER_INTIMIDATION"] = "VOTER_INTIMIDATION";
    IncidentType["BALLOT_SNATCHING"] = "BALLOT_SNATCHING";
    IncidentType["BALLOT_STUFFING"] = "BALLOT_STUFFING";
    IncidentType["VOTE_BUYING"] = "VOTE_BUYING";
    IncidentType["VIOLENCE_THUGGERY"] = "VIOLENCE_THUGGERY";
    IncidentType["MATERIALS_SHORTAGE"] = "MATERIALS_SHORTAGE";
    IncidentType["LATE_OR_FAILED_OPENING"] = "LATE_OR_FAILED_OPENING";
    IncidentType["BVAS_MALFUNCTION"] = "BVAS_MALFUNCTION";
    IncidentType["UNAUTHORIZED_PERSONNEL"] = "UNAUTHORIZED_PERSONNEL";
    IncidentType["OVERVOTING"] = "OVERVOTING";
    IncidentType["OPPOSITION_DISRUPTION"] = "OPPOSITION_DISRUPTION";
    IncidentType["OTHERS"] = "OTHERS";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "LOW";
    IncidentSeverity["MEDIUM"] = "MEDIUM";
    IncidentSeverity["HIGH"] = "HIGH";
    IncidentSeverity["CRITICAL"] = "CRITICAL";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
function isIncidentSeverityUrgent(severity) {
    return severity === IncidentSeverity.HIGH || severity === IncidentSeverity.CRITICAL;
}
var FieldReportStatus;
(function (FieldReportStatus) {
    FieldReportStatus["OPEN"] = "OPEN";
    FieldReportStatus["ESCALATED"] = "ESCALATED";
    FieldReportStatus["RESOLVED"] = "RESOLVED";
})(FieldReportStatus || (exports.FieldReportStatus = FieldReportStatus = {}));
var PollingUnitStrength;
(function (PollingUnitStrength) {
    PollingUnitStrength["STRONG"] = "STRONG";
    PollingUnitStrength["SWING"] = "SWING";
    PollingUnitStrength["WEAK"] = "WEAK";
})(PollingUnitStrength || (exports.PollingUnitStrength = PollingUnitStrength = {}));
var PollingUnitStatus;
(function (PollingUnitStatus) {
    PollingUnitStatus["ACTIVE"] = "ACTIVE";
    PollingUnitStatus["INACTIVE"] = "INACTIVE";
    PollingUnitStatus["NEEDS_ATTENTION"] = "NEEDS_ATTENTION";
})(PollingUnitStatus || (exports.PollingUnitStatus = PollingUnitStatus = {}));
var SituationStatus;
(function (SituationStatus) {
    SituationStatus["OPEN"] = "OPEN";
    SituationStatus["REPORTING"] = "REPORTING";
    SituationStatus["CLOSED"] = "CLOSED";
    SituationStatus["INCIDENT"] = "INCIDENT";
})(SituationStatus || (exports.SituationStatus = SituationStatus = {}));
exports.MFA_REQUIRED_ROLES = [
    CampaignRole.CANDIDATE,
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.NATIONAL_COLLATION_OFFICER,
];
