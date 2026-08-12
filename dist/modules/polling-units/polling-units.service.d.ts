import { Prisma } from '@electromon/db';
import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePollingUnitDto, ListPollingUnitsQueryDto, UpdatePollingUnitDto } from './dto/polling-unit.dto';
export declare class PollingUnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
    private getCampaignStateId;
    private assertWardInCampaignState;
    private assertAgentInCampaign;
    private enrichWithAgents;
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
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        wardId: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
            lgaId: string;
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        wardId: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
            lgaId: string;
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        wardId: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
            lgaId: string;
            latitude: number | null;
            longitude: number | null;
            updatedAt: Date;
            registrationAreaCode: string | null;
        };
        id: string;
        createdAt: Date;
        name: string;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        wardId: string;
        code: string;
        latitude: number | null;
        longitude: number | null;
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
        notes: string | null;
        updatedAt: Date;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
