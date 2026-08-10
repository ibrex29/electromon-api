export declare class AnalyticsCountsDto {
    supportGroups: number;
    activeSupportGroups: number;
    volunteers: number;
    verifiedVolunteers: number;
    commitments: number;
    activeCommitments: number;
    completedCommitments: number;
    pollingUnits: number;
    assignedPollingUnits: number;
    fieldReports: number;
    urgentFieldReports: number;
    situationUpdates: number;
    urgentSituations: number;
    incidents: number;
}
export declare class CommitmentProgressDto {
    totalTarget: number;
    totalCurrent: number;
    percent: number;
}
export declare class PuBreakdownDto {
    strong: number;
    swing: number;
    weak: number;
    unassessed: number;
}
export declare class TopVolunteerDto {
    id: string;
    firstName: string;
    lastName: string;
    role?: string | null;
    performanceScore: number;
}
export declare class RecentActivityDto {
    type: string;
    id: string;
    title: string;
    subtitle?: string;
    isUrgent: boolean;
    createdAt: Date;
}
export declare class LgaCoverageDto {
    lgaId: string;
    lgaName: string;
    pollingUnits: number;
    assignedAgents: number;
    volunteers: number;
}
export declare class AnalyticsOverviewDto {
    campaignId: string;
    state: string;
    counts: AnalyticsCountsDto;
    commitmentProgress: CommitmentProgressDto;
    pollingUnitStrength: PuBreakdownDto;
    topVolunteers: TopVolunteerDto[];
    recentActivity: RecentActivityDto[];
    lgaCoverage: LgaCoverageDto[];
}
