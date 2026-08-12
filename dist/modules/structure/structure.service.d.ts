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
            campaigns: number;
            lgas: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        code: string;
        updatedAt: Date;
    })[]>;
    getLgasByState(stateId: string): import("db/dist").Prisma.PrismaPromise<({
        senatorialDistrict: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            stateId: string;
        } | null;
        _count: {
            wards: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        stateId: string;
        senatorialDistrictId: string | null;
    })[]>;
    getWardsByLga(lgaId: string): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            volunteers: number;
            pollingUnits: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        lgaId: string;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        registrationAreaCode: string | null;
    })[]>;
    getPollingUnitsByWard(wardId: string): import("db/dist").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import("db/dist").$Enums.PollingUnitStatus;
        wardId: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
        updatedAt: Date;
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
