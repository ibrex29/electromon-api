import { PollingUnitStatus, PollingUnitStrength } from '@electromon/shared';
export declare class PollingUnitWardLgaDto {
    id: string;
    name: string;
}
export declare class PollingUnitWardDto {
    id: string;
    name: string;
    lga: PollingUnitWardLgaDto;
}
export declare class AssignedAgentDto {
    id: string;
    firstName: string;
    lastName: string;
}
export declare class PollingUnitResponseDto {
    id: string;
    code: string;
    name: string;
    wardId: string;
    ward: PollingUnitWardDto;
    latitude?: number | null;
    longitude?: number | null;
    strengthAssessment?: PollingUnitStrength | null;
    status: PollingUnitStatus;
    assignedAgentId?: string | null;
    assignedAgent?: AssignedAgentDto | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
