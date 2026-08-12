import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSupportGroupDto, ListSupportGroupsQueryDto, UpdateSupportGroupDto } from './dto/support-group.dto';
export declare class SupportGroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
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
        category: import("@electromon/db").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("@electromon/db").$Enums.VerificationStatus;
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
        category: import("@electromon/db").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("@electromon/db").$Enums.VerificationStatus;
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
        category: import("@electromon/db").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("@electromon/db").$Enums.VerificationStatus;
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
        category: import("@electromon/db").$Enums.SupportGroupCategory;
        leaderName: string;
        leaderPhone: string;
        leaderEmail: string | null;
        memberCount: number;
        areaOfOperation: string | null;
        verificationStatus: import("@electromon/db").$Enums.VerificationStatus;
        coordinatorId: string | null;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private assertLgaInJigawaCampaign;
}
