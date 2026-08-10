import { SupportGroupCategory, VerificationStatus } from '@electromon/shared';
export declare class CreateSupportGroupDto {
    campaignId: string;
    name: string;
    category: SupportGroupCategory;
    leaderName: string;
    leaderPhone: string;
    leaderEmail?: string;
    memberCount?: number;
    lgaId?: string;
    areaOfOperation?: string;
}
declare const UpdateSupportGroupDto_base: import("@nestjs/common").Type<Partial<CreateSupportGroupDto>>;
export declare class UpdateSupportGroupDto extends UpdateSupportGroupDto_base {
    verificationStatus?: VerificationStatus;
}
export declare class ListSupportGroupsQueryDto {
    campaignId: string;
    category?: SupportGroupCategory;
    verificationStatus?: VerificationStatus;
    lgaId?: string;
    search?: string;
}
export {};
