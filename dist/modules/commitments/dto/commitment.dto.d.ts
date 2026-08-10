import { CommitmentStatus } from '@electromon/db';
export declare class CreateCommitmentDto {
    campaignId: string;
    supportGroupId: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue?: number;
    deadline: string;
    status?: CommitmentStatus;
}
declare const UpdateCommitmentDto_base: import("@nestjs/common").Type<Partial<CreateCommitmentDto>>;
export declare class UpdateCommitmentDto extends UpdateCommitmentDto_base {
}
export declare class ListCommitmentsQueryDto {
    campaignId: string;
    status?: CommitmentStatus;
    supportGroupId?: string;
    search?: string;
}
export {};
