"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARTY_COLUMNS = exports.NIGERIAN_REGISTERED_PARTIES = exports.DEFAULT_TRACKED_PARTIES = void 0;
exports.getPartyCodes = getPartyCodes;
exports.normalizeTrackedParties = normalizeTrackedParties;
exports.emptyPartyTotals = emptyPartyTotals;
exports.parsePartyTotals = parsePartyTotals;
exports.sumPartyMaps = sumPartyMaps;
const nigerian_parties_1 = require("./nigerian-parties");
Object.defineProperty(exports, "NIGERIAN_REGISTERED_PARTIES", { enumerable: true, get: function () { return nigerian_parties_1.NIGERIAN_REGISTERED_PARTIES; } });
/** Fallback when campaign.trackedParties is missing — full INEC party list */
exports.DEFAULT_TRACKED_PARTIES = nigerian_parties_1.NIGERIAN_REGISTERED_PARTIES;
/** @deprecated Use campaign.trackedParties — kept for backwards compatibility */
exports.PARTY_COLUMNS = exports.DEFAULT_TRACKED_PARTIES.map((p) => p.code);
function getPartyCodes(parties) {
    return parties.map((party) => party.code);
}
function normalizeTrackedParties(input) {
    if (!Array.isArray(input) || input.length === 0) {
        return exports.DEFAULT_TRACKED_PARTIES;
    }
    const seen = new Set();
    return input.filter((item) => {
        if (!item ||
            typeof item !== 'object' ||
            typeof item.code !== 'string' ||
            typeof item.name !== 'string') {
            return false;
        }
        const code = item.code.toUpperCase();
        if (seen.has(code))
            return false;
        seen.add(code);
        return true;
    });
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
    const codes = [...new Set(values.flatMap((entry) => Object.keys(entry)))];
    const totals = emptyPartyTotals(codes);
    for (const entry of values) {
        for (const code of codes) {
            totals[code] = (totals[code] ?? 0) + (entry[code] ?? 0);
        }
    }
    return totals;
}
