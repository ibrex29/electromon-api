export interface TrackedParty {
  code: string;
  name: string;
  color?: string;
}

/** Default Jigawa 2027 governorship contestants */
export const DEFAULT_TRACKED_PARTIES: TrackedParty[] = [
  { code: 'APC', name: 'All Progressives Congress', color: '#2563eb' },
  { code: 'PDP', name: "People's Democratic Party", color: '#dc2626' },
  { code: 'NNPP', name: 'New Nigeria Peoples Party', color: '#d97706' },
];

/** @deprecated Use campaign.trackedParties — kept for backwards compatibility */
export const PARTY_COLUMNS = DEFAULT_TRACKED_PARTIES.map((p) => p.code) as readonly string[];

export type PartyCode = string;
export type PartyTotals = Record<string, number>;

export function getPartyCodes(parties: TrackedParty[]): string[] {
  return parties.map((party) => party.code);
}

export function normalizeTrackedParties(input: unknown): TrackedParty[] {
  if (!Array.isArray(input) || input.length === 0) {
    return DEFAULT_TRACKED_PARTIES;
  }

  return input
    .filter((item): item is TrackedParty => {
      return (
        !!item &&
        typeof item === 'object' &&
        typeof (item as TrackedParty).code === 'string' &&
        typeof (item as TrackedParty).name === 'string'
      );
    })
    .slice(0, 5);
}

export function emptyPartyTotals(partyCodes: string[] = getPartyCodes(DEFAULT_TRACKED_PARTIES)): PartyTotals {
  return Object.fromEntries(partyCodes.map((code) => [code, 0]));
}

export function parsePartyTotals(
  input: unknown,
  partyCodes: string[] = getPartyCodes(DEFAULT_TRACKED_PARTIES),
): PartyTotals {
  const totals = emptyPartyTotals(partyCodes);
  if (!input || typeof input !== 'object') return totals;

  for (const party of partyCodes) {
    const value = (input as Record<string, unknown>)[party];
    if (typeof value === 'number' && Number.isFinite(value)) {
      totals[party] = value;
    }
  }

  return totals;
}

export function sumPartyMaps(values: PartyTotals[]): PartyTotals {
  if (values.length === 0) return {};
  const codes = Object.keys(values[0] ?? {});
  const totals = emptyPartyTotals(codes);
  for (const entry of values) {
    for (const code of codes) {
      totals[code] = (totals[code] ?? 0) + (entry[code] ?? 0);
    }
  }
  return totals;
}
