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
            lgaId: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            ward: {
                id: string;
                name: string;
                lgaId: string;
            };
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
        type: import("@electromon/db").$Enums.FieldReportType;
        description: string;
        title: string;
        wardId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        status: import("@electromon/db").$Enums.FieldReportStatus;
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
            lgaId: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            ward: {
                id: string;
                name: string;
                lgaId: string;
            };
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
        type: import("@electromon/db").$Enums.FieldReportType;
        description: string;
        title: string;
        wardId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        status: import("@electromon/db").$Enums.FieldReportStatus;
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
            lgaId: string;
        } | null;
        pollingUnit: {
            id: string;
            name: string;
            ward: {
                id: string;
                name: string;
                lgaId: string;
            };
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
        type: import("@electromon/db").$Enums.FieldReportType;
        description: string;
        title: string;
        wardId: string | null;
        updatedAt: Date;
        latitude: number | null;
        longitude: number | null;
        status: import("@electromon/db").$Enums.FieldReportStatus;
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
