import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertCampaignAccess;
    getOverview(user: JwtPayload, campaignId: string): Promise<{
        campaignId: string;
        state: string;
        counts: {
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
        };
        commitmentProgress: {
            totalTarget: number;
            totalCurrent: number;
            percent: number;
        };
        pollingUnitStrength: {
            strong: number;
            swing: number;
            weak: number;
            unassessed: number;
        };
        topVolunteers: {
            id: string;
            firstName: string;
            lastName: string;
            role: string | null;
            performanceScore: number;
        }[];
        recentActivity: ({
            type: "field_report";
            id: string;
            title: string;
            subtitle: string;
            isUrgent: boolean;
            createdAt: Date;
        } | {
            type: "situation_update";
            id: string;
            title: string;
            subtitle: string;
            isUrgent: boolean;
            createdAt: Date;
        } | {
            type: "commitment";
            id: string;
            title: string;
            subtitle: string;
            isUrgent: boolean;
            createdAt: Date;
        })[];
        lgaCoverage: {
            lgaId: string;
            lgaName: string;
            pollingUnits: number;
            assignedAgents: number;
            volunteers: number;
        }[];
    }>;
}
