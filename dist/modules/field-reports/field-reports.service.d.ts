import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFieldReportDto, ListFieldReportsQueryDto, UpdateFieldReportStatusDto } from './dto/field-report.dto';
export declare class FieldReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
    list(user: JwtPayload, query: ListFieldReportsQueryDto): Promise<({
        ward: {
            id: string;
            name: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        } | null;
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
        handledBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.FieldReportStatus;
        type: import("@electromon/db").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
        incidentType: import("@electromon/db").$Enums.IncidentType | null;
        incidentSeverity: import("@electromon/db").$Enums.IncidentSeverity | null;
        pollingUnitId: string | null;
        photoUrls: string[];
        wardComment: string | null;
        handledById: string | null;
        handledAt: Date | null;
    })[]>;
    create(user: JwtPayload, dto: CreateFieldReportDto): Promise<{
        ward: {
            id: string;
            name: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        } | null;
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
        handledBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.FieldReportStatus;
        type: import("@electromon/db").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
        incidentType: import("@electromon/db").$Enums.IncidentType | null;
        incidentSeverity: import("@electromon/db").$Enums.IncidentSeverity | null;
        pollingUnitId: string | null;
        photoUrls: string[];
        wardComment: string | null;
        handledById: string | null;
        handledAt: Date | null;
    }>;
    updateStatus(user: JwtPayload, id: string, dto: UpdateFieldReportStatusDto): Promise<{
        ward: {
            id: string;
            name: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            code: string;
        } | null;
        reporter: {
            id: string;
            firstName: string;
            lastName: string;
        };
        handledBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.FieldReportStatus;
        type: import("@electromon/db").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
        incidentType: import("@electromon/db").$Enums.IncidentType | null;
        incidentSeverity: import("@electromon/db").$Enums.IncidentSeverity | null;
        pollingUnitId: string | null;
        photoUrls: string[];
        wardComment: string | null;
        handledById: string | null;
        handledAt: Date | null;
    }>;
}
