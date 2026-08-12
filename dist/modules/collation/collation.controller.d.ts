import { CampaignRole, CollationResultStatus, JwtPayload } from '@electromon/shared';
import { CollationService } from './collation.service';
import { CollationBrowseService } from './collation-browse.service';
import { CreateCollationResultDto, RejectCollationResultDto, AttachEc8aPhotoDto, ApproveCollationResultDto } from './dto/collation.dto';
export declare class CollationController {
    private collationService;
    private browseService;
    constructor(collationService: CollationService, browseService: CollationBrowseService);
    getContext(user: JwtPayload): Promise<{
        campaignId: string;
        campaignName: string;
        stateId: string;
        stateName: string;
        stateCode: string;
        role: CampaignRole | undefined;
        scopeType: import("@electromon/shared").ScopeType | undefined;
        scopeId: string | undefined;
        clientPartyCode: string | null;
        trackedParties: import("@electromon/shared").TrackedParty[];
        partyColumns: string[];
    }>;
    browseLgas(user: JwtPayload, page?: string, limit?: string, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "LGA";
        data: {
            id: string;
            name: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browseWards(user: JwtPayload, lgaId: string, page?: string, limit?: string, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "WARD";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string | undefined;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browseMyWards(user: JwtPayload, page?: string, limit?: string, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "WARD";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string | undefined;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    browsePollingUnits(user: JwtPayload, wardId: string, page?: string, limit?: string, search?: string): Promise<{
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    raceAnalytics(user: JwtPayload): Promise<{
        stateName: string;
        stateId: string;
        clientPartyCode: string;
        summary: {
            lgaCount: number;
            wins: number;
            losses: number;
            ties: number;
            pending: number;
            statewideTotalVotes: number;
            clientVotes: number;
            raceLead: number;
            rivalCode: string | null;
            rivalVotes: number;
            reporting: {
                pollingUnitsTotal: number;
                pollingUnitsReported: number;
                percent: number;
            };
            incidents: {
                open: number;
                urgent: number;
            };
        };
        partyStandings: {
            code: string;
            name: string;
            votes: number;
            share: number;
        }[];
        lgas: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        biggestLeads: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        biggestDeficits: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
        closestRaces: {
            id: string;
            name: string;
            parties: Record<string, number>;
            totalVotes: number;
            clientVotes: number;
            margin: number;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            resultStatus: string;
            share: number;
        }[];
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }>;
    situationMap(user: JwtPayload, lgaId?: string, wardId?: string): Promise<({
        mode: "overview";
        lgaId: null;
        wardId: null;
        lgas: {
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
        wards: never[];
        pollingUnits: never[];
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }) | ({
        mode: "detail";
        lgaId: string;
        wardId: string | null;
        lgas: ReturnType<CollationBrowseService["mapOutcomeRow"]>[];
        wards: {
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
        pollingUnits: {
            wardId: string;
            wardName: string;
            registrationAreaCode: string | undefined;
            id: string;
            name: string;
            code: string | undefined;
            parties: Record<string, number>;
            totalVotes: number;
            resultStatus: string | undefined;
            latitude: number | null;
            longitude: number | null;
            href: string | undefined;
            outcome: "WIN" | "LOSS" | "TIE" | "PENDING";
            leadingParty: string | null;
            margin: number;
            incidentCount: number;
            incidentUrgentCount: number;
            incidentWeight: number;
            maxSeverity: string | null;
        }[];
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    })>;
    browseMyPollingUnits(user: JwtPayload, page?: string, limit?: string, search?: string, lgaId?: string, wardId?: string, hasResults?: string): Promise<({
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: {
            id: string;
            name: string;
            href: string;
        } | undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
            resultStatus: string;
            latitude: number | null;
            longitude: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    }) | ({
        stateName: string;
        stateId: string;
        title: string;
        subtitle: string;
        level: "POLLING_UNIT";
        parent: undefined;
        data: {
            id: string;
            name: string;
            code: string;
            parties: import("@electromon/shared").PartyTotals;
            totalVotes: number;
            href: string;
            subtitle: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } & {
        trackedParties: import("@electromon/shared").TrackedParty[];
        clientPartyCode: string | null;
        partyColumns: string[];
    })>;
    getDashboard(user: JwtPayload): Promise<{
        dashboard: {
            level: import("@electromon/shared").CollationLevel;
            levelLabel: string;
            levelOrder: number;
            scopeType: import("@electromon/shared").ScopeType;
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
            level: import("db/dist").$Enums.CollationLevel;
            scopeType: import("db/dist").$Enums.ScopeType;
            scopeId: string;
            registeredVoters: number | null;
            accreditedVoters: number | null;
            votesCast: number | null;
            partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
            ec8aPhotoUrls: string[];
            approvalComment: string | null;
            status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    })[]>;
    getPollingUnitResult(user: JwtPayload, puId: string): Promise<{
        id: string | undefined;
        status: import("db/dist").$Enums.CollationResultStatus | null;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: string | number | boolean | import("db/dist/generated/runtime/client").JsonObject | import("db/dist/generated/runtime/client").JsonArray | null;
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
        level: import("db/dist").$Enums.CollationLevel | import("@electromon/shared").CollationLevel;
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
        scopeType?: import("db/dist").$Enums.ScopeType | undefined;
        approvalComment?: string | null | undefined;
        submittedById?: string | null | undefined;
        approvedById?: string | null | undefined;
        flaggedPollingUnitIds?: string[] | undefined;
        parentResultId?: string | null | undefined;
    }>;
    listPending(user: JwtPayload): Promise<({
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
    approveAllLgaWardResults(user: JwtPayload, dto: ApproveCollationResultDto): Promise<{
        approvedCount: number;
        wardIds: string[];
    }>;
    listWardPuSubmissions(user: JwtPayload, page?: string, limit?: string, search?: string, status?: CollationResultStatus | 'NOT_STARTED'): Promise<{
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
            level: import("db/dist").$Enums.CollationLevel;
            scopeType: import("db/dist").$Enums.ScopeType;
            scopeId: string;
            registeredVoters: number | null;
            accreditedVoters: number | null;
            votesCast: number | null;
            partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
            ec8aPhotoUrls: string[];
            approvalComment: string | null;
            status: import("db/dist").$Enums.CollationResultStatus;
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
            level: import("@electromon/shared").CollationLevel;
            scopeType: import("@electromon/shared").ScopeType;
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
    resubmitWardToLga(user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
    upsertResult(user: JwtPayload, dto: CreateCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    attachEc8a(user: JwtPayload, id: string, dto: AttachEc8aPhotoDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    approveResult(user: JwtPayload, id: string, dto: ApproveCollationResultDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
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
        level: import("db/dist").$Enums.CollationLevel;
        scopeType: import("db/dist").$Enums.ScopeType;
        scopeId: string;
        registeredVoters: number | null;
        accreditedVoters: number | null;
        votesCast: number | null;
        partyResults: import("db/dist/generated/runtime/client").JsonValue | null;
        ec8aPhotoUrls: string[];
        approvalComment: string | null;
        status: import("db/dist").$Enums.CollationResultStatus;
        submittedById: string | null;
        submittedAt: Date | null;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        flaggedPollingUnitIds: string[];
        parentResultId: string | null;
    }>;
    listActionLogs(user: JwtPayload, id: string): Promise<({
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
        action: import("db/dist").$Enums.CollationActionType;
        actorId: string;
        fromStatus: import("db/dist").$Enums.CollationResultStatus | null;
        toStatus: import("db/dist").$Enums.CollationResultStatus;
        comment: string | null;
        metadata: import("db/dist/generated/runtime/client").JsonValue | null;
    })[]>;
}
