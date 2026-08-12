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
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
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
        strengthAssessment: import("@electromon/db").$Enums.PollingUnitStrength | null;
        status: import("@electromon/db").$Enums.PollingUnitStatus;
        assignedAgentId: string | null;
        historicalResults: Prisma.JsonValue | null;
        notes: string | null;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
