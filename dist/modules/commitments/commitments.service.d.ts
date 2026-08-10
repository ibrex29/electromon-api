import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommitmentDto, ListCommitmentsQueryDto, UpdateCommitmentDto } from './dto/commitment.dto';
export declare class CommitmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
    private assertSupportGroupInCampaign;
    list(user: JwtPayload, query: ListCommitmentsQueryDto): Promise<({
        supportGroup: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CommitmentStatus;
        updatedAt: Date;
        description: string | null;
        title: string;
        supportGroupId: string;
        targetValue: number;
        currentValue: number;
        deadline: Date;
    })[]>;
    findOne(user: JwtPayload, id: string): Promise<{
        supportGroup: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CommitmentStatus;
        updatedAt: Date;
        description: string | null;
        title: string;
        supportGroupId: string;
        targetValue: number;
        currentValue: number;
        deadline: Date;
    }>;
    create(user: JwtPayload, dto: CreateCommitmentDto): Promise<{
        supportGroup: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CommitmentStatus;
        updatedAt: Date;
        description: string | null;
        title: string;
        supportGroupId: string;
        targetValue: number;
        currentValue: number;
        deadline: Date;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateCommitmentDto): Promise<{
        supportGroup: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CommitmentStatus;
        updatedAt: Date;
        description: string | null;
        title: string;
        supportGroupId: string;
        targetValue: number;
        currentValue: number;
        deadline: Date;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
