import { StructureService } from './structure.service';
export declare class StructureController {
    private structureService;
    constructor(structureService: StructureService);
    getStates(): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            campaigns: number;
            lgas: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
    })[]>;
    getLgas(stateId: string): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            wards: number;
        };
        senatorialDistrict: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            stateId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        stateId: string;
        senatorialDistrictId: string | null;
    })[]>;
    getWards(lgaId: string): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            volunteers: number;
            pollingUnits: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        lgaId: string;
        registrationAreaCode: string | null;
        latitude: number | null;
        longitude: number | null;
    })[]>;
    getPollingUnits(wardId: string): import("db/dist").Prisma.PrismaPromise<{
        status: import("db/dist").$Enums.PollingUnitStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        wardId: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
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
