import type { JwtPayload } from '@electromon/shared';
import { CreateSituationUpdateDto, ListSituationUpdatesQueryDto, SituationSummaryQueryDto, UpdateSituationUpdateDto } from './dto/situation-update.dto';
import { SituationRoomService } from './situation-room.service';
export declare class SituationRoomController {
    private situationRoomService;
    constructor(situationRoomService: SituationRoomService);
    summary(user: JwtPayload, query: SituationSummaryQueryDto): Promise<{
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
        latitude: number | null;
        longitude: number | null;
        status: import("db/dist").$Enums.SituationStatus;
        notes: string | null;
        isUrgent: boolean;
        reportedById: string;
        pollingUnitId: string;
    })[]>;
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
        latitude: number | null;
        longitude: number | null;
        status: import("db/dist").$Enums.SituationStatus;
        notes: string | null;
        isUrgent: boolean;
        reportedById: string;
        pollingUnitId: string;
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
        latitude: number | null;
        longitude: number | null;
        status: import("db/dist").$Enums.SituationStatus;
        notes: string | null;
        isUrgent: boolean;
        reportedById: string;
        pollingUnitId: string;
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
        latitude: number | null;
        longitude: number | null;
        status: import("db/dist").$Enums.SituationStatus;
        notes: string | null;
        isUrgent: boolean;
        reportedById: string;
        pollingUnitId: string;
    }>;
    remove(user: JwtPayload, id: string, campaignId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
