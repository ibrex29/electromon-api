import { CommitmentStatus } from '@electromon/db';
export declare class CommitmentSupportGroupDto {
    id: string;
    name: string;
}
export declare class CommitmentResponseDto {
    id: string;
    campaignId: string;
    supportGroupId: string;
    supportGroup: CommitmentSupportGroupDto;
    title: string;
    description?: string | null;
    targetValue: number;
    currentValue: number;
    deadline: Date;
    status: CommitmentStatus;
    createdAt: Date;
    updatedAt: Date;
}
