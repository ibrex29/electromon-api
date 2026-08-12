import type { JwtPayload } from '@electromon/shared';
import { CreatePollingUnitDto, ListPollingUnitsQueryDto, UpdatePollingUnitDto } from './dto/polling-unit.dto';
import { PollingUnitsService } from './polling-units.service';
export declare class PollingUnitsController {
    private pollingUnitsService;
    constructor(pollingUnitsService: PollingUnitsService);
    list(user: JwtPayload, query: ListPollingUnitsQueryDto): Promise<{
        assignedAgent: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        ward: {
            lga: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            lgaId: string;
            updatedAt: Date;
            registrationAreaCode: string | null;
            latitude: number | null;
            longitude: number | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        wardId: string;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        code: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        status: import("db/dist").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
    }[]>;
    findOne(user: JwtPayload, id: string, campaignId: string): Promise<{
        assignedAgent: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        ward: {
            lga: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            lgaId: string;
            updatedAt: Date;
            registrationAreaCode: string | null;
            latitude: number | null;
            longitude: number | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        wardId: string;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        code: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        status: import("db/dist").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
    }>;
    create(user: JwtPayload, dto: CreatePollingUnitDto): Promise<{
        assignedAgent: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        ward: {
            lga: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            lgaId: string;
            updatedAt: Date;
            registrationAreaCode: string | null;
            latitude: number | null;
            longitude: number | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        wardId: string;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        code: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        status: import("db/dist").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
    }>;
    update(user: JwtPayload, id: string, dto: UpdatePollingUnitDto): Promise<{
        assignedAgent: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        ward: {
            lga: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            lgaId: string;
            updatedAt: Date;
            registrationAreaCode: string | null;
            latitude: number | null;
            longitude: number | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        wardId: string;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        code: string;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        status: import("db/dist").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
