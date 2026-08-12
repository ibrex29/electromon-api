import { CampaignRole, JwtPayload, ScopeType, TrackedParty } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
type MapOutcome = 'WIN' | 'LOSS' | 'TIE' | 'PENDING';
export interface BrowseRow {
    id: string;
    name: string;
    code?: string;
    subtitle?: string;
    parties: Record<string, number>;
    totalVotes: number;
    href?: string;
    resultStatus?: 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | string;
    latitude?: number | null;
    longitude?: number | null;
}
export interface PaginatedBrowseResult {
    stateName: string;
    stateId: string;
    title: string;
    subtitle: string;
    level: 'LGA' | 'WARD' | 'POLLING_UNIT';
    parent?: {
        id: string;
        name: string;
        href?: string;
    };
    trackedParties: TrackedParty[];
    clientPartyCode?: string | null;
    partyColumns: string[];
    data: BrowseRow[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class CollationBrowseService {
    private prisma;
    constructor(prisma: PrismaService);
    getContext(user: JwtPayload): Promise<{
        campaignId: string;
        campaignName: string;
        stateId: string;
        stateName: string;
        stateCode: string;
        role: CampaignRole | undefined;
        scopeType: ScopeType | undefined;
        scopeId: string | undefined;
        clientPartyCode: string | null;
        trackedParties: TrackedParty[];
        partyColumns: string[];
    }>;
    private getCampaignPartyConfig;
    private withPartyMeta;
    browseLgas(user: JwtPayload, page?: number, limit?: number, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "LGA";
        data: {
            id: string;
            name: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browseWards(user: JwtPayload, lgaId: string, page?: number, limit?: number, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "WARD";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string | undefined;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browseWardsForUser(user: JwtPayload, page?: number, limit?: number, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "WARD";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string | undefined;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browsePollingUnits(user: JwtPayload, wardId: string, page?: number, limit?: number, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browsePollingUnitsForUser(user: JwtPayload, page?: number, limit?: number, search?: string, filters?: {
        lgaId?: string;
        wardId?: string;
        hasResults?: boolean;
    }): Promise<({
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }) | ({
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    })>;
    private applyHasResultsFilter;
    situationMapPoints(user: JwtPayload, filters: {
        lgaId?: string;
        wardId?: string;
    }): Promise<({
        mode: "overview";
        lgaId: null;
        wardId: null;
        lgas: {
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: MapOutcome;
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
        wards: never[];
        pollingUnits: never[];
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }) | ({
        mode: "detail";
        lgaId: string;
        wardId: string | null;
        lgas: ReturnType<CollationBrowseService["mapOutcomeRow"]>[];
        wards: {
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: MapOutcome;
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
        pollingUnits: {
            wardId: string;
            wardName: string;
            registrationAreaCode: string | undefined;
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: MapOutcome;
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    })>;
    situationMapOverview(user: JwtPayload): Promise<{
        mode: "overview";
        lgaId: null;
        wardId: null;
        lgas: {
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: MapOutcome;
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
        wards: never[];
        pollingUnits: never[];
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    getRaceAnalytics(user: JwtPayload): Promise<{
        stateName: string;
        stateId: string;
        clientPartyCode: string;
        summary: {
            lgaCount: number;
            wins: number;
            losses: number;
            ties: number;
            pending: number;
            statewideTotalVotes: number;
            clientVotes: number;
            raceLead: number;
            rivalCode: string | null;
            rivalVotes: number;
            reporting: {
                pollingUnitsTotal: number;
                pollingUnitsReported: number;
                percent: number;
            };
            incidents: {
                open: number;
                urgent: number;
            };
        };
        partyStandings: {
            code: string;
            name: string;
            votes: number;
            share: number;
        }[];
        lgas: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        biggestLeads: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        biggestDeficits: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        closestRaces: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
    } & {
        trackedParties: TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    private mapOutcomeRow;
    private aggregateIncidentsByScope;
    private buildMeta;
    private assertCanBrowseLevel;
    private isScopedToPu;
    private isScopedToWard;
    private isScopedToLga;
}
export {};
