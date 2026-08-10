import type { JwtPayload } from '@electromon/shared';
import { CreateFieldReportDto, ListFieldReportsQueryDto, UpdateFieldReportStatusDto } from './dto/field-report.dto';
import { FieldReportsService } from './field-reports.service';
export declare class FieldReportsController {
    private fieldReportsService;
    constructor(fieldReportsService: FieldReportsService);
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
        status: import("db/dist").$Enums.FieldReportStatus;
        type: import("db/dist").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
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
        status: import("db/dist").$Enums.FieldReportStatus;
        type: import("db/dist").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
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
        status: import("db/dist").$Enums.FieldReportStatus;
        type: import("db/dist").$Enums.FieldReportType;
        wardId: string | null;
        latitude: number | null;
        longitude: number | null;
        updatedAt: Date;
        description: string;
        title: string;
        isUrgent: boolean;
        reportedById: string;
        pollingUnitId: string | null;
        photoUrls: string[];
        wardComment: string | null;
        handledById: string | null;
        handledAt: Date | null;
    }>;
}
