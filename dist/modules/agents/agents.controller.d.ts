import { CampaignRole, type JwtPayload } from '@electromon/shared';
import { AgentsService } from './agents.service';
import { ListAgentsQueryDto } from './dto/agents.dto';
export declare class AgentsController {
    private agentsService;
    constructor(agentsService: AgentsService);
    listOptions(user: JwtPayload, campaignId: string, lgaId?: string): Promise<{
        lga: {
            id: string;
            name: string;
        };
        ward: {
            id: string;
            name: string;
        };
        wards: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
            pollingUnits: {
                id: string;
                name: string;
                code: string;
            }[];
        }[];
    } | {
        lga: {
            id: string;
            name: string;
        };
        wards: {
            id: string;
            name: string;
            registrationAreaCode: string | null;
            pollingUnits: {
                id: string;
                name: string;
                code: string;
            }[];
        }[];
        ward?: undefined;
    }>;
    list(user: JwtPayload, query: ListAgentsQueryDto): Promise<{
        membershipId: string;
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        role: CampaignRole;
        scopeType: import("@electromon/shared").ScopeType;
        scopeId: string;
        scopeName: string;
        wardName: string | null;
        lgaName: string | null;
        isActive: boolean;
        userActive: boolean;
        createdAt: Date;
    }[]>;
    listActivities(user: JwtPayload, membershipId: string): Promise<{
        agent: {
            membershipId: string;
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            email: string;
            role: CampaignRole;
            scopeType: import("@electromon/shared").ScopeType;
            scopeId: string;
            scopeName: string;
            wardName: string | null;
            lgaName: string | null;
            isActive: boolean;
            userActive: boolean;
            createdAt: Date;
        };
        activities: {
            createdAt: string;
            id: string;
            kind: "COLLATION" | "INCIDENT_REPORTED" | "INCIDENT_HANDLED";
            title: string;
            detail: string | null;
            status: string | null;
        }[];
    }>;
}
