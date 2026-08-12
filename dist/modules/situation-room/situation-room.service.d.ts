import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSituationUpdateDto, ListSituationUpdatesQueryDto, UpdateSituationUpdateDto } from './dto/situation-update.dto';
export declare class SituationRoomService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
    private getCampaignStateId;
    private assertPollingUnitInCampaign;
    private campaignPuFilter;
    list(user: JwtPayload, query: ListSituationUpdatesQueryDto): Promise<({
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        };
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@electromon/db").$Enums.SituationStatus;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        reportedById: string;
        pollingUnitId: string;
        isUrgent: boolean;
    })[]>;
    getSummary(user: JwtPayload, campaignId: string): Promise<{
        campaignId: string;
        totalUpdates: number;
        open: number;
        reporting: number;
        closed: number;
        incidents: number;
        urgent: number;
        totalPollingUnits: number;
        unitsWithUpdates: number;
    }>;
    findOne(user: JwtPayload, id: string, campaignId: string): Promise<{
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        };
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@electromon/db").$Enums.SituationStatus;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        reportedById: string;
        pollingUnitId: string;
        isUrgent: boolean;
    }>;
    create(user: JwtPayload, dto: CreateSituationUpdateDto): Promise<{
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        };
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@electromon/db").$Enums.SituationStatus;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        reportedById: string;
        pollingUnitId: string;
        isUrgent: boolean;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateSituationUpdateDto): Promise<{
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        };
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@electromon/db").$Enums.SituationStatus;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        reportedById: string;
        pollingUnitId: string;
        isUrgent: boolean;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
