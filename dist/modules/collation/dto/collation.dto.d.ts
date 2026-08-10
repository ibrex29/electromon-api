export declare class CreateCollationResultDto {
    registeredVoters?: number;
    accreditedVoters?: number;
    votesCast?: number;
    partyResults?: Record<string, number>;
    ec8aPhotoUrls?: string[];
}
export declare class AttachEc8aPhotoDto {
    photoUrl: string;
}
export declare class RejectCollationResultDto {
    reason: string;
}
export declare class ApproveCollationResultDto {
    comment?: string;
}
