import { CollationLevel, ScopeType } from '@electromon/shared';
import { CampaignRole } from '@electromon/shared';
import { PrismaService } from '../prisma/prisma.service';
export declare class ScopeResolverService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveScopeName(scopeType?: ScopeType | null, scopeId?: string | null): Promise<string | undefined>;
    buildDashboard(role: CampaignRole, scopeType?: ScopeType | null, scopeId?: string | null): Promise<import("@electromon/shared").CollationDashboardMeta | undefined>;
    resolveScopeChain(scopeType: ScopeType, scopeId: string): Promise<{
        pollingUnit: {
            id: string;
            code: string;
            name: string;
        };
        ward: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
        };
        lga: {
            id: string;
            name: string;
        };
        state: {
            id: string;
            name: string;
            code: string;
        };
        national: {
            id: string;
            name: string;
        };
    } | {
        ward: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
        };
        lga: {
            id: string;
            name: string;
        };
        state: {
            id: string;
            name: string;
            code: string;
        };
        national: {
            id: string;
            name: string;
        };
        pollingUnit?: undefined;
    } | {
        lga: {
            id: string;
            name: string;
        };
        state: {
            id: string;
            name: string;
            code: string;
        };
        national: {
            id: string;
            name: string;
        };
        pollingUnit?: undefined;
        ward?: undefined;
    } | {
        state: {
            id: string;
            name: string;
            code: string;
        };
        national: {
            id: string;
            name: string;
        };
        pollingUnit?: undefined;
        ward?: undefined;
        lga?: undefined;
    } | {
        national: {
            id: string;
            name: string;
        };
        pollingUnit?: undefined;
        ward?: undefined;
        lga?: undefined;
        state?: undefined;
    } | {
        pollingUnit?: undefined;
        ward?: undefined;
        lga?: undefined;
        state?: undefined;
        national?: undefined;
    }>;
    getLevelForUser(role?: CampaignRole, scopeType?: ScopeType | null): CollationLevel | undefined;
    getChildScopeType(level: CollationLevel): ScopeType | undefined;
}
