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
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
            lgaId: string;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("db/dist").$Enums.PollingUnitStatus;
        code: string;
        wardId: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
        updatedAt: Date;
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
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
            lgaId: string;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("db/dist").$Enums.PollingUnitStatus;
        code: string;
        wardId: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
        updatedAt: Date;
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
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
            lgaId: string;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("db/dist").$Enums.PollingUnitStatus;
        code: string;
        wardId: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
        updatedAt: Date;
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
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
            lgaId: string;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("db/dist").$Enums.PollingUnitStatus;
        code: string;
        wardId: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("db/dist").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: import("db/dist/generated/runtime/client").JsonValue | null;
        notes: string | null;
        updatedAt: Date;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
