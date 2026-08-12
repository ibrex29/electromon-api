import { CampaignRole, JwtPayload, ScopeType } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAgentDto, ListAgentsQueryDto, UpdateAgentDto } from './dto/agents.dto';
export declare class AgentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertManager;
    private assertCampaignAccess;
    private resolveManagedLgaId;
    private requireManagedLgaId;
    private isWardRole;
    private isPuRole;
    private assertManageableRole;
    private resolveScopeInLga;
    private mapAgent;
    private enrichMemberships;
    listOptions(user: JwtPayload, campaignId: string, lgaId?: string): Promise<{
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
    }>;
    list(user: JwtPayload, query: ListAgentsQueryDto): Promise<{
        membershipId: string;
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        role: CampaignRole;
        scopeType: ScopeType;
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
            scopeType: ScopeType;
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
    create(user: JwtPayload, dto: CreateAgentDto): Promise<{
        membershipId: string;
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        role: CampaignRole;
        scopeType: ScopeType;
        scopeId: string;
        scopeName: string;
        wardName: string | null;
        lgaName: string | null;
        isActive: boolean;
        userActive: boolean;
        createdAt: Date;
    }>;
    update(user: JwtPayload, membershipId: string, dto: UpdateAgentDto): Promise<{
        membershipId: string;
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        role: CampaignRole;
        scopeType: ScopeType;
        scopeId: string;
        scopeName: string;
        wardName: string | null;
        lgaName: string | null;
        isActive: boolean;
        userActive: boolean;
        createdAt: Date;
    }>;
}
