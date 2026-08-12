import { CampaignRole, ScopeType } from '@electromon/shared';
export declare const WARD_AGENT_ROLE = CampaignRole.WARD_RA_OFFICER;
export declare const PU_AGENT_ROLE = CampaignRole.POLLING_AGENT;
export declare const MANAGEABLE_AGENT_ROLES: readonly [CampaignRole.WARD_RA_OFFICER, CampaignRole.POLLING_AGENT];
export type ManageableAgentRole = (typeof MANAGEABLE_AGENT_ROLES)[number];
export declare class ListAgentsQueryDto {
    campaignId: string;
    kind?: 'ward' | 'pu' | 'all';
    lgaId?: string;
    wardId?: string;
    search?: string;
    includeInactive?: boolean;
}
export declare class CreateAgentDto {
    campaignId: string;
    role: ManageableAgentRole;
    scopeId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    password: string;
}
export declare class UpdateAgentDto {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    role?: ManageableAgentRole;
    scopeId?: string;
    isActive?: boolean;
    password?: string;
}
export declare class AgentResponseDto {
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
    wardName?: string | null;
    lgaName?: string | null;
    isActive: boolean;
    userActive: boolean;
    createdAt: Date;
}
