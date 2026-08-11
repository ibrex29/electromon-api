import { CollationResultStatus, JwtPayload } from '@electromon/shared';
import { Prisma } from '@electromon/db';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import { CreateCollationResultDto, RejectCollationResultDto, ApproveCollationResultDto } from './dto/collation.dto';
export declare class CollationService {
    private prisma;
    private scopeResolver;
    constructor(prisma: PrismaService, scopeResolver: ScopeResolverService);
    getDashboard(user: JwtPayload): Promise<{
        dashboard: import("@electromon/shared").CollationDashboardMeta | undefined;
        scopeChain: {
            pollingUnit: {
                id: string;
                code: string;
                name: string;
            };
            ward: {
                id: string;
                name: string;
                registrationAreaCode: string | null;
            };
            lga: {
                id: string;
                name: string;
            };
            state: {
                id: string;
                name: string;
                code: string;
            };
            national: {
                id: string;
                name: string;
            };
        } | {
            ward: {
                id: string;
                name: string;
                registrationAreaCode: string | null;
            };
            lga: {
                id: string;
                name: string;
            };
            state: {
                id: string;
                name: string;
                code: string;
            };
            national: {
                id: string;
                name: string;
            };
            pollingUnit?: undefined;
        } | {
            lga: {
                id: string;
                name: string;
            };
            state: {
                id: string;
                name: string;
                code: string;
            };
            national: {
                id: string;
                name: string;
            };
            pollingUnit?: undefined;
            ward?: undefined;
        } | {
            state: {
                id: string;
                name: string;
                code: string;
            };
            national: {
                id: string;
                name: string;
            };
            pollingUnit?: undefined;
            ward?: undefined;
            lga?: undefined;
        } | {
            national: {
                id: string;
                name: string;
            };
            pollingUnit?: undefined;
            ward?: undefined;
            lga?: undefined;
            state?: undefined;
        } | {
            pollingUnit?: undefined;
            ward?: undefined;
            lga?: undefined;
            state?: undefined;
            national?: undefined;
        } | null;
        pendingApprovals: number;
        myResult: {
            id: string;
            createdAt: Date;
            campaignId: string;
            status: import("@electromon/db").$Enums.CollationResultStatus;
            level: import("@electromon/db").$Enums.CollationLevel;
            updatedAt: Date;
            scopeType: import("@electromon/db").$Enums.ScopeType;
            scopeId: string;
            registeredVoters: number | null;
            accreditedVoters: number | null;
            votesCast: number | null;
            partyResults: Prisma.JsonValue | null;
            ec8aPhotoUrls: string[];
            approvalComment: string | null;
            submittedById: string | null;
            submittedAt: Date | null;
            approvedById: string | null;
            approvedAt: Date | null;
            rejectionReason: string | null;
            parentResultId: string | null;
        } | null;
    }>;
    listResults(user: JwtPayload, status?: CollationResultStatus): Promise<({
        submittedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        approvedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    })[]>;
    listPendingApprovals(user: JwtPayload): Promise<({
        submittedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    } & {
        pollingUnit: {
            id: string;
            name: string;
            code: string;
            wardId: string;
        } | null;
    })[]>;
    listWardPuSubmissions(user: JwtPayload, options?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: CollationResultStatus;
    }): Promise<{
        data: ({
            submittedBy: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            approvedBy: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            campaignId: string;
            status: import("@electromon/db").$Enums.CollationResultStatus;
            level: import("@electromon/db").$Enums.CollationLevel;
            updatedAt: Date;
            scopeType: import("@electromon/db").$Enums.ScopeType;
            scopeId: string;
            registeredVoters: number | null;
            accreditedVoters: number | null;
            votesCast: number | null;
            partyResults: Prisma.JsonValue | null;
            ec8aPhotoUrls: string[];
            approvalComment: string | null;
            submittedById: string | null;
            submittedAt: Date | null;
            approvedById: string | null;
            approvedAt: Date | null;
            rejectionReason: string | null;
            parentResultId: string | null;
        } & {
            pollingUnit: {
                id: string;
                name: string;
                code: string;
                wardId: string;
            } | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        statusCounts: {
            submitted: number;
            approved: number;
            rejected: number;
        };
    }>;
    listLgaWardSubmissions(user: JwtPayload): Promise<({
        submittedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        approvedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    } & {
        ward: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
            lgaId: string;
        } | null;
    })[]>;
    listLgaWardPuResults(user: JwtPayload, wardId: string): Promise<({
        submittedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        approvedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    } & {
        pollingUnit: {
            id: string;
            name: string;
            code: string;
            wardId: string;
        } | null;
    })[]>;
    getLgaPuResult(user: JwtPayload, puId: string): Promise<({
        submittedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        approvedBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    } & {
        pollingUnit: {
            id: string;
            name: string;
            code: string;
            wardId: string;
        } | null;
    }) | null>;
    approveAllLgaWardResults(user: JwtPayload, dto?: ApproveCollationResultDto): Promise<{
        approvedCount: number;
        wardIds: string[];
    }>;
    private enrichWardResults;
    private enrichPuResults;
    upsertResult(user: JwtPayload, dto: CreateCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    }>;
    attachEc8aPhoto(user: JwtPayload, id: string, photoUrl: string): Promise<{
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    }>;
    submitResult(user: JwtPayload, id: string): Promise<{
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    }>;
    approveResult(user: JwtPayload, id: string, dto?: ApproveCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    }>;
    rejectResult(user: JwtPayload, id: string, dto: RejectCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        campaignId: string;
        status: import("@electromon/db").$Enums.CollationResultStatus;
        level: import("@electromon/db").$Enums.CollationLevel;
        updatedAt: Date;
        scopeType: import("@electromon/db").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: Prisma.JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        parentResultId: string | null;
    }>;
    private assertCollationUser;
    private getOwnedResult;
    private verifyApproverScope;
    private countPendingApprovals;
    private getChildScopeIds;
    private aggregatePartyResults;
    private rollupToParent;
}
