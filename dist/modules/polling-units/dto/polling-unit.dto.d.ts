import { PollingUnitStatus, PollingUnitStrength } from '@electromon/shared';
export declare class CreatePollingUnitDto {
    campaignId: string;
    code: string;
    name: string;
    wardId: string;
    latitude?: number;
    longitude?: number;
    strengthAssessment?: PollingUnitStrength;
    status?: PollingUnitStatus;
    assignedAgentId?: string;
    notes?: string;
}
declare const UpdatePollingUnitDto_base: import("@nestjs/common").Type<Partial<CreatePollingUnitDto>>;
export declare class UpdatePollingUnitDto extends UpdatePollingUnitDto_base {
}
export declare class ListPollingUnitsQueryDto {
    campaignId: string;
    lgaId?: string;
    wardId?: string;
    status?: PollingUnitStatus;
    strength?: PollingUnitStrength;
    search?: string;
}
export {};
