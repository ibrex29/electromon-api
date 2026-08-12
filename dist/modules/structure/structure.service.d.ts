import { CollationLevel } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class StructureService {
    private prisma;
    constructor(prisma: PrismaService);
    getCollationHierarchy(): {
        level: CollationLevel;
        levelOrder: number;
        label: string;
        scopeType: import("@electromon/shared").ScopeType;
        description: string;
        approvesFrom: CollationLevel | null;
        submitsTo: CollationLevel | null;
        dashboardRoute: string;
    }[];
    getStates(): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            lgas: number;
            campaigns: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getLgasByState(stateId: string): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            wards: number;
        };
        senatorialDistrict: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            stateId: string;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stateId: string;
        senatorialDistrictId: string | null;
    })[]>;
    getWardsByLga(lgaId: string): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            pollingUnits: number;
            volunteers: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        registrationAreaCode: string | null;
        lgaId: string;
        latitude: number | null;
        longitude: number | null;
    })[]>;
    getPollingUnitsByWard(wardId: string): import("db/dist").Prisma.PrismaPromise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        wardId: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        status: import("db/dist").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
    }[]>;
    getCoverageStats(campaignId: string): Promise<{
        campaignId: string;
        state: string;
        totalLgas: number;
        totalWards: number;
        totalPollingUnits: number;
        assignedCoordinators: number;
    }>;
}
