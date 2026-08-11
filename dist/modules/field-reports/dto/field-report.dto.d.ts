import { FieldReportStatus, FieldReportType, IncidentType, IncidentSeverity } from '@electromon/shared';
export declare class CreateFieldReportDto {
    campaignId: string;
    type: FieldReportType;
    incidentType?: IncidentType;
    incidentSeverity?: IncidentSeverity;
    title: string;
    description: string;
    wardId?: string;
    pollingUnitId?: string;
    latitude?: number;
    longitude?: number;
    isUrgent?: boolean;
    photoUrls?: string[];
}
export declare class ListFieldReportsQueryDto {
    campaignId: string;
    type?: FieldReportType;
    incidentType?: IncidentType;
    incidentSeverity?: IncidentSeverity;
    isUrgent?: boolean;
    search?: string;
    pollingUnitId?: string;
    reportedById?: string;
    wardId?: string;
    status?: FieldReportStatus;
}
export declare class UpdateFieldReportStatusDto {
    status: FieldReportStatus;
    wardComment?: string;
}
