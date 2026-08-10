import { SupportGroupCategory, VerificationStatus } from '@electromon/shared';
export declare class SupportGroupLgaDto {
    id: string;
    name: string;
}
export declare class SupportGroupResponseDto {
    id: string;
    campaignId: string;
    name: string;
    category: SupportGroupCategory;
    leaderName: string;
    leaderPhone: string;
    leaderEmail?: string | null;
    memberCount: number;
    lgaId?: string | null;
    lga?: SupportGroupLgaDto | null;
    areaOfOperation?: string | null;
    verificationStatus: VerificationStatus;
    createdAt: Date;
    updatedAt: Date;
}
