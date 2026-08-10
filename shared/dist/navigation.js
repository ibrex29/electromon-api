"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNavItemsForRole = getNavItemsForRole;
exports.getDefaultDashboardPath = getDefaultDashboardPath;
const enums_1 = require("./enums");
const collation_1 = require("./collation");
const ADMIN_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/lgas', label: 'Local Governments' },
    { href: '/dashboard/results', label: 'Results' },
    { href: '/dashboard/volunteers', label: 'Volunteers' },
    { href: '/dashboard/situation-room', label: 'Situation Room' },
    { href: '/dashboard/analytics', label: 'Analytics' },
];
const STATE_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/lgas', label: 'Local Governments' },
    { href: '/dashboard/results', label: 'Results' },
];
const LGA_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/my-lga', label: 'Wards' },
    { href: '/dashboard/polling-stations', label: 'Polling Stations' },
    { href: '/dashboard/results', label: 'Results' },
];
const WARD_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/polling-stations', label: 'Polling Stations' },
    { href: '/dashboard/volunteers', label: 'Volunteers' },
    { href: '/dashboard/results', label: 'Results' },
];
const PU_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/my-unit', label: 'My Polling Unit' },
    { href: '/dashboard/results', label: 'Results' },
];
const NATIONAL_NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/lgas', label: 'Local Governments' },
    { href: '/dashboard/results', label: 'Results' },
];
function getNavItemsForRole(role) {
    switch (role) {
        case enums_1.CampaignRole.NATIONAL_COLLATION_OFFICER:
            return NATIONAL_NAV;
        case enums_1.CampaignRole.STATE_COLLATION_OFFICER:
        case enums_1.CampaignRole.STATE_COORDINATOR:
            return STATE_NAV;
        case enums_1.CampaignRole.LGA_COLLATION_OFFICER:
        case enums_1.CampaignRole.LGA_COORDINATOR:
            return LGA_NAV;
        case enums_1.CampaignRole.WARD_RA_OFFICER:
        case enums_1.CampaignRole.WARD_COORDINATOR:
            return WARD_NAV;
        case enums_1.CampaignRole.POLLING_UNIT_OFFICER:
        case enums_1.CampaignRole.POLLING_AGENT:
            return PU_NAV;
        case enums_1.CampaignRole.CAMPAIGN_DIRECTOR:
        case enums_1.CampaignRole.CANDIDATE:
            return ADMIN_NAV;
        default:
            return STATE_NAV;
    }
}
function getDefaultDashboardPath(role) {
    const level = role ? (0, collation_1.getCollationLevelForRole)(role) : undefined;
    switch (level) {
        case collation_1.CollationLevel.POLLING_UNIT:
            return '/dashboard/my-unit';
        case collation_1.CollationLevel.WARD:
            return '/dashboard/polling-stations';
        case collation_1.CollationLevel.LGA:
            return '/dashboard/my-lga';
        case collation_1.CollationLevel.STATE:
        case collation_1.CollationLevel.NATIONAL:
            return '/dashboard/lgas';
        default:
            return '/dashboard';
    }
}
