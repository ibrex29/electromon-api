"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLATION_HIERARCHY = exports.LEVEL_TO_SCOPE_TYPE = exports.ROLE_TO_COLLATION_LEVEL = exports.COLLATION_ROLES = exports.NATIONAL_SCOPE_ID = exports.CollationResultStatus = exports.CollationLevel = void 0;
exports.getCollationLevelForRole = getCollationLevelForRole;
exports.buildDashboardMeta = buildDashboardMeta;
exports.getParentLevel = getParentLevel;
exports.getChildLevel = getChildLevel;
const enums_1 = require("./enums");
var CollationLevel;
(function (CollationLevel) {
    CollationLevel["POLLING_UNIT"] = "POLLING_UNIT";
    CollationLevel["WARD"] = "WARD";
    CollationLevel["LGA"] = "LGA";
    CollationLevel["STATE"] = "STATE";
    CollationLevel["NATIONAL"] = "NATIONAL";
})(CollationLevel || (exports.CollationLevel = CollationLevel = {}));
var CollationResultStatus;
(function (CollationResultStatus) {
    CollationResultStatus["DRAFT"] = "DRAFT";
    CollationResultStatus["SUBMITTED"] = "SUBMITTED";
    CollationResultStatus["APPROVED"] = "APPROVED";
    CollationResultStatus["REJECTED"] = "REJECTED";
})(CollationResultStatus || (exports.CollationResultStatus = CollationResultStatus = {}));
exports.NATIONAL_SCOPE_ID = 'NGA';
exports.COLLATION_ROLES = [
    enums_1.CampaignRole.POLLING_AGENT,
    enums_1.CampaignRole.WARD_RA_OFFICER,
    enums_1.CampaignRole.LGA_COLLATION_OFFICER,
    enums_1.CampaignRole.STATE_COLLATION_OFFICER,
    enums_1.CampaignRole.NATIONAL_COLLATION_OFFICER,
];
/** One role per collation level (legacy dual roles map to the same level for old rows) */
exports.ROLE_TO_COLLATION_LEVEL = {
    [enums_1.CampaignRole.POLLING_AGENT]: CollationLevel.POLLING_UNIT,
    [enums_1.CampaignRole.POLLING_UNIT_OFFICER]: CollationLevel.POLLING_UNIT, // legacy
    [enums_1.CampaignRole.WARD_RA_OFFICER]: CollationLevel.WARD,
    [enums_1.CampaignRole.WARD_COORDINATOR]: CollationLevel.WARD, // legacy
    [enums_1.CampaignRole.LGA_COLLATION_OFFICER]: CollationLevel.LGA,
    [enums_1.CampaignRole.LGA_COORDINATOR]: CollationLevel.LGA, // legacy
    [enums_1.CampaignRole.STATE_COLLATION_OFFICER]: CollationLevel.STATE,
    [enums_1.CampaignRole.STATE_COORDINATOR]: CollationLevel.STATE, // legacy
    [enums_1.CampaignRole.NATIONAL_COLLATION_OFFICER]: CollationLevel.NATIONAL,
};
exports.LEVEL_TO_SCOPE_TYPE = {
    [CollationLevel.POLLING_UNIT]: enums_1.ScopeType.POLLING_UNIT,
    [CollationLevel.WARD]: enums_1.ScopeType.WARD,
    [CollationLevel.LGA]: enums_1.ScopeType.LGA,
    [CollationLevel.STATE]: enums_1.ScopeType.STATE,
    [CollationLevel.NATIONAL]: enums_1.ScopeType.NATIONAL,
};
exports.COLLATION_HIERARCHY = [
    CollationLevel.POLLING_UNIT,
    CollationLevel.WARD,
    CollationLevel.LGA,
    CollationLevel.STATE,
    CollationLevel.NATIONAL,
];
const LEVEL_META = {
    [CollationLevel.POLLING_UNIT]: {
        level: CollationLevel.POLLING_UNIT,
        levelLabel: 'Polling Unit (PU)',
        levelOrder: 1,
        canSubmit: true,
        canApprove: false,
        submitsToLevel: CollationLevel.WARD,
        route: '/dashboard/polling-unit',
    },
    [CollationLevel.WARD]: {
        level: CollationLevel.WARD,
        levelLabel: 'Ward / Registration Area (RA)',
        levelOrder: 2,
        canSubmit: false,
        canApprove: true,
        approvesFromLevel: CollationLevel.POLLING_UNIT,
        submitsToLevel: CollationLevel.LGA,
        route: '/dashboard/ward',
    },
    [CollationLevel.LGA]: {
        level: CollationLevel.LGA,
        levelLabel: 'Local Government Area (LGA)',
        levelOrder: 3,
        canSubmit: true,
        canApprove: true,
        approvesFromLevel: CollationLevel.WARD,
        submitsToLevel: CollationLevel.STATE,
        route: '/dashboard/lga',
    },
    [CollationLevel.STATE]: {
        level: CollationLevel.STATE,
        levelLabel: 'State Collation Centre',
        levelOrder: 4,
        canSubmit: true,
        canApprove: true,
        approvesFromLevel: CollationLevel.LGA,
        submitsToLevel: CollationLevel.NATIONAL,
        route: '/dashboard/state',
    },
    [CollationLevel.NATIONAL]: {
        level: CollationLevel.NATIONAL,
        levelLabel: 'National Collation Centre (Abuja)',
        levelOrder: 5,
        canSubmit: true,
        canApprove: true,
        approvesFromLevel: CollationLevel.STATE,
        route: '/dashboard/national',
    },
};
function getCollationLevelForRole(role) {
    if (!role)
        return undefined;
    return exports.ROLE_TO_COLLATION_LEVEL[role];
}
function buildDashboardMeta(role, scopeType, scopeId, scopeName) {
    const level = getCollationLevelForRole(role);
    if (!level)
        return undefined;
    const meta = LEVEL_META[level];
    return {
        ...meta,
        scopeType: scopeType ?? exports.LEVEL_TO_SCOPE_TYPE[level],
        scopeId: scopeId ?? undefined,
        scopeName,
    };
}
function getParentLevel(level) {
    const index = exports.COLLATION_HIERARCHY.indexOf(level);
    return index > 0 ? exports.COLLATION_HIERARCHY[index - 1] : undefined;
}
function getChildLevel(level) {
    const index = exports.COLLATION_HIERARCHY.indexOf(level);
    return index >= 0 && index < exports.COLLATION_HIERARCHY.length - 1
        ? exports.COLLATION_HIERARCHY[index + 1]
        : undefined;
}
