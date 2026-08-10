import { CampaignRole, JwtPayload, ScopeType, TrackedParty } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface BrowseRow {
    id: string;
    name: string;
    code?: string;
    subtitle?: string;
    parties: Record<string, number>;
    totalVotes: number;
    href?: string;
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
        };
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
        };
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
        };
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
    }>;
    browsePollingUnitsForUser(user: JwtPayload, page?: number, limit?: number, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
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
    }>;
    private buildMeta;
    private assertCanBrowseLevel;
    private isScopedToPu;
    private isScopedToWard;
    private isScopedToLga;
}
