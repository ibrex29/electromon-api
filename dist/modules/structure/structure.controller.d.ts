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
        name: string;
        code: string;
        updatedAt: Date;
    })[]>;
    getLgas(stateId: string): import("db/dist").Prisma.PrismaPromise<({
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
    getWards(lgaId: string): import("db/dist").Prisma.PrismaPromise<({
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
    getPollingUnits(wardId: string): import("db/dist").Prisma.PrismaPromise<{
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
