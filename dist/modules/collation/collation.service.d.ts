import { CollationLevel, CollationResultStatus, JwtPayload, ScopeType } from '@electromon/shared';
import { Prisma } from '@electromon/db';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import { CreateCollationResultDto, RejectCollationResultDto, ApproveCollationResultDto } from './dto/collation.dto';
export declare class CollationService {
    private prisma;
    private scopeResolver;
    constructor(prisma: PrismaService, scopeResolver: ScopeResolverService);
    getDashboard(user: JwtPayload): Promise<{
        dashboard: {
            level: CollationLevel;
            levelLabel: string;
            levelOrder: number;
            scopeType: ScopeType;
            scopeId: string;
            scopeName: string;
            canSubmit: boolean;
            canApprove: boolean;
            route: string;
        };
        scopeChain: {
            state: {
                id: string;
                name: string;
            };
        };
        pendingApprovals: number;
        myResult: null;
    } | {
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
            updatedAt: Date;
            campaignId: string;
            level: import("@electromon/db").$Enums.CollationLevel;
            status: import("@electromon/db").$Enums.CollationResultStatus;
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
            flaggedPollingUnitIds: string[];
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
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    })[]>;
    getPollingUnitResultForViewer(user: JwtPayload, pollingUnitId: string): Promise<{
        id: string | undefined;
        status: import("@electromon/db").$Enums.CollationResultStatus | null;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        rejectionReason: string | null;
        submittedAt: Date | null;
        ec8aPhotoUrls: string[];
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
        approvedAt: Date | null;
        level: CollationLevel | import("@electromon/db").$Enums.CollationLevel;
        scopeId: string;
        pollingUnit: {
            id: string;
            name: string;
            code: string;
            wardId: string;
            wardName: string;
            lgaName: string;
        };
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        campaignId?: string | undefined;
        scopeType?: import("@electromon/db").$Enums.ScopeType | undefined;
        approvalComment?: string | null | undefined;
        submittedById?: string | null | undefined;
        approvedById?: string | null | undefined;
        flaggedPollingUnitIds?: string[] | undefined;
        parentResultId?: string | null | undefined;
    }>;
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
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
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
        status?: CollationResultStatus | 'NOT_STARTED';
    }): Promise<{
        data: ({
            pollingUnit: {
                id: string;
                name: string;
                code: string;
                wardId: string;
            };
            flaggedByLga: boolean;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campaignId: string;
            level: import("@electromon/db").$Enums.CollationLevel;
            status: import("@electromon/db").$Enums.CollationResultStatus;
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
            flaggedPollingUnitIds: string[];
            parentResultId: string | null;
        } | {
            id: string;
            campaignId: string;
            level: CollationLevel;
            scopeType: ScopeType;
            scopeId: string;
            registeredVoters: null;
            accreditedVoters: null;
            votesCast: null;
            partyResults: null;
            ec8aPhotoUrls: string[];
            approvalComment: null;
            status: "NOT_STARTED";
            submittedById: null;
            submittedAt: null;
            approvedById: null;
            approvedAt: null;
            rejectionReason: null;
            parentResultId: null;
            createdAt: null;
            updatedAt: null;
            submittedBy: null;
            approvedBy: null;
            pollingUnit: {
                id: string;
                name: string;
                code: string;
                wardId: string;
            };
            flaggedByLga: boolean;
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
            draft: number;
            notStarted: number;
            totalPus: number;
        };
        wardMeta: {
            returnedByLga: boolean;
            canReturnApprovedPus: boolean;
            canResubmitToLga: boolean;
            rejectionReason: string | null;
            flaggedPollingUnitIds: string[];
            flaggedPollingUnits: {
                id: string;
                name: string;
                code: string;
            }[];
        };
    }>;
    listLgaWardSubmissions(user: JwtPayload): Promise<{
        puReadiness: {
            totalPus: number;
            approvedPus: number;
            submittedPus: number;
            rejectedPus: number;
            missingPus: number;
            readyForLgaApproval: boolean;
        };
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
        ward: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
            lgaId: string;
        } | null;
    }[]>;
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
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
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
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
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
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    attachEc8aPhoto(user: JwtPayload, id: string, photoUrl: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    submitResult(user: JwtPayload, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    approveResult(user: JwtPayload, id: string, dto?: ApproveCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    rejectResult(user: JwtPayload, id: string, dto: RejectCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    resubmitWardToLga(user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("@electromon/db").$Enums.CollationLevel;
        status: import("@electromon/db").$Enums.CollationResultStatus;
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
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    returnLgaFlaggedPus(user: JwtPayload, dto: RejectCollationResultDto): Promise<{
        returnedCount: number;
        flaggedCount: number;
        reason: string;
    }>;
    private validatePuIdsInWard;
    private isWardReturnedByLga;
    private rebuildWardRollupAfterPuChange;
    listActionLogs(user: JwtPayload, resultId: string): Promise<({
        actor: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        collationResultId: string;
        action: import("@electromon/db").$Enums.CollationActionType;
        actorId: string;
        fromStatus: import("@electromon/db").$Enums.CollationResultStatus | null;
        toStatus: import("@electromon/db").$Enums.CollationResultStatus;
        comment: string | null;
        metadata: Prisma.JsonValue | null;
    })[]>;
    private getWardPuReadinessMap;
    private assertAllPollingUnitsApprovedInWard;
    private writeActionLog;
    private assertCollationUser;
    private getOwnedResult;
    private verifyApproverScope;
    private countPendingApprovals;
    private getChildScopeIds;
    private aggregatePartyResults;
    private rollupToParent;
}
