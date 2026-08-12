import type { JwtPayload } from '@electromon/shared';
import { CreateCommitmentDto, ListCommitmentsQueryDto, UpdateCommitmentDto } from './dto/commitment.dto';
import { CommitmentsService } from './commitments.service';
export declare class CommitmentsController {
    private commitmentsService;
    constructor(commitmentsService: CommitmentsService);
    list(user: JwtPayload, query: ListCommitmentsQueryDto): Promise<({
        supportGroup: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        description: string | null;
        title: string;
        status: import("db/dist").$Enums.CommitmentStatus;
        updatedAt: Date;
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
        description: string | null;
        title: string;
        status: import("db/dist").$Enums.CommitmentStatus;
        updatedAt: Date;
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
        description: string | null;
        title: string;
        status: import("db/dist").$Enums.CommitmentStatus;
        updatedAt: Date;
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
        description: string | null;
        title: string;
        status: import("db/dist").$Enums.CommitmentStatus;
        updatedAt: Date;
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
