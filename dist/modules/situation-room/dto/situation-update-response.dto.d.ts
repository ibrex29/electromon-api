import { SituationStatus } from '@electromon/shared';
export declare class SituationPollingUnitDto {
    id: string;
    code: string;
    name: string;
}
export declare class SituationReporterDto {
    id: string;
    firstName: string;
    lastName: string;
}
export declare class SituationUpdateResponseDto {
    id: string;
    pollingUnitId: string;
    pollingUnit: SituationPollingUnitDto;
    reportedById: string;
    reporter: SituationReporterDto;
    status: SituationStatus;
    notes?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    isUrgent: boolean;
    createdAt: Date;
}
export declare class SituationSummaryDto {
    campaignId: string;
    totalUpdates: number;
    open: number;
    reporting: number;
    closed: number;
    incidents: number;
    urgent: number;
    totalPollingUnits: number;
    unitsWithUpdates: number;
}
