import { StructureService } from './structure.service';
export declare class StructureController {
    private structureService;
    constructor(structureService: StructureService);
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
    getLgas(stateId: string): import("db/dist").Prisma.PrismaPromise<({
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
    getWards(lgaId: string): import("db/dist").Prisma.PrismaPromise<({
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
    getPollingUnits(wardId: string): import("db/dist").Prisma.PrismaPromise<{
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
    getCollationHierarchy(): {
        level: import("shared/dist").CollationLevel;
        levelOrder: number;
        label: string;
        scopeType: import("shared/dist").ScopeType;
        description: string;
        approvesFrom: import("shared/dist").CollationLevel | null;
        submitsTo: import("shared/dist").CollationLevel | null;
        dashboardRoute: string;
    }[];
    getCoverage(campaignId: string): Promise<{
        campaignId: string;
        state: string;
        totalLgas: number;
        totalWards: number;
        totalPollingUnits: number;
        assignedCoordinators: number;
    }>;
}
