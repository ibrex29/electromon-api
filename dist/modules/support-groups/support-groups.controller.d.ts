import type { JwtPayload } from '@electromon/shared';
import { CreateSupportGroupDto, ListSupportGroupsQueryDto, UpdateSupportGroupDto } from './dto/support-group.dto';
import { SupportGroupsService } from './support-groups.service';
export declare class SupportGroupsController {
    private supportGroupsService;
    constructor(supportGroupsService: SupportGroupsService);
    list(user: JwtPayload, query: ListSupportGroupsQueryDto): Promise<({
        lga: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        name: string;
        lgaId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        category: import("db/dist").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("db/dist").$Enums.VerificationStatus;
        coordinatorId: string | null;
    })[]>;
    findOne(user: JwtPayload, id: string): Promise<{
        lga: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        name: string;
        lgaId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        category: import("db/dist").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("db/dist").$Enums.VerificationStatus;
        coordinatorId: string | null;
    }>;
    create(user: JwtPayload, dto: CreateSupportGroupDto): Promise<{
        lga: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        name: string;
        lgaId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        category: import("db/dist").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("db/dist").$Enums.VerificationStatus;
        coordinatorId: string | null;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateSupportGroupDto): Promise<{
        lga: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        name: string;
        lgaId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        category: import("db/dist").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("db/dist").$Enums.VerificationStatus;
        coordinatorId: string | null;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
