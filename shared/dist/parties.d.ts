import { NIGERIAN_REGISTERED_PARTIES } from './nigerian-parties';
export interface TrackedParty {
    code: string;
    name: string;
    color?: string;
}
/** Fallback when campaign.trackedParties is missing — full INEC party list */
export declare const DEFAULT_TRACKED_PARTIES: TrackedParty[];
export { NIGERIAN_REGISTERED_PARTIES };
/** @deprecated Use campaign.trackedParties — kept for backwards compatibility */
export declare const PARTY_COLUMNS: readonly string[];
export type PartyCode = string;
export type PartyTotals = Record<string, number>;
export declare function getPartyCodes(parties: TrackedParty[]): string[];
export declare function normalizeTrackedParties(input: unknown): TrackedParty[];
export declare function emptyPartyTotals(partyCodes?: string[]): PartyTotals;
export declare function parsePartyTotals(input: unknown, partyCodes?: string[]): PartyTotals;
export declare function sumPartyMaps(values: PartyTotals[]): PartyTotals;
