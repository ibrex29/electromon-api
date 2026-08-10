"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARTY_COLUMNS = exports.DEFAULT_TRACKED_PARTIES = void 0;
exports.getPartyCodes = getPartyCodes;
exports.normalizeTrackedParties = normalizeTrackedParties;
exports.emptyPartyTotals = emptyPartyTotals;
exports.parsePartyTotals = parsePartyTotals;
exports.sumPartyMaps = sumPartyMaps;
/** Default Jigawa 2027 governorship contestants */
exports.DEFAULT_TRACKED_PARTIES = [
    { code: 'APC', name: 'All Progressives Congress', color: '#2563eb' },
    { code: 'PDP', name: "People's Democratic Party", color: '#dc2626' },
    { code: 'NNPP', name: 'New Nigeria Peoples Party', color: '#d97706' },
];
/** @deprecated Use campaign.trackedParties — kept for backwards compatibility */
exports.PARTY_COLUMNS = exports.DEFAULT_TRACKED_PARTIES.map((p) => p.code);
function getPartyCodes(parties) {
    return parties.map((party) => party.code);
}
function normalizeTrackedParties(input) {
    if (!Array.isArray(input) || input.length === 0) {
        return exports.DEFAULT_TRACKED_PARTIES;
    }
    return input
        .filter((item) => {
        return (!!item &&
            typeof item === 'object' &&
            typeof item.code === 'string' &&
            typeof item.name === 'string');
    })
        .slice(0, 5);
}
function emptyPartyTotals(partyCodes = getPartyCodes(exports.DEFAULT_TRACKED_PARTIES)) {
    return Object.fromEntries(partyCodes.map((code) => [code, 0]));
}
function parsePartyTotals(input, partyCodes = getPartyCodes(exports.DEFAULT_TRACKED_PARTIES)) {
    const totals = emptyPartyTotals(partyCodes);
    if (!input || typeof input !== 'object')
        return totals;
    for (const party of partyCodes) {
        const value = input[party];
        if (typeof value === 'number' && Number.isFinite(value)) {
            totals[party] = value;
        }
    }
    return totals;
}
function sumPartyMaps(values) {
    if (values.length === 0)
        return {};
    const codes = Object.keys(values[0] ?? {});
    const totals = emptyPartyTotals(codes);
    for (const entry of values) {
        for (const code of codes) {
            totals[code] = (totals[code] ?? 0) + (entry[code] ?? 0);
        }
    }
    return totals;
}
