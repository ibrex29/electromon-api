import { SituationStatus } from '@electromon/shared';
export declare class CreateSituationUpdateDto {
    campaignId: string;
    pollingUnitId: string;
    status: SituationStatus;
    notes?: string;
    latitude?: number;
    longitude?: number;
    isUrgent?: boolean;
}
declare const UpdateSituationUpdateDto_base: import("@nestjs/common").Type<Partial<CreateSituationUpdateDto>>;
export declare class UpdateSituationUpdateDto extends UpdateSituationUpdateDto_base {
}
export declare class ListSituationUpdatesQueryDto {
    campaignId: string;
    status?: SituationStatus;
    pollingUnitId?: string;
    reportedById?: string;
    isUrgent?: boolean;
}
export declare class SituationSummaryQueryDto {
    campaignId: string;
}
export {};
