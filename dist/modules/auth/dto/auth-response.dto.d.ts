import { CampaignRole, CollationDashboardMeta, ScopeType } from '@electromon/shared';
export declare class CollationDashboardDto implements CollationDashboardMeta {
    level: CollationDashboardMeta['level'];
    levelLabel: string;
    levelOrder: number;
    scopeType: ScopeType;
    scopeId?: string;
    scopeName?: string;
    canSubmit: boolean;
    canApprove: boolean;
    approvesFromLevel?: CollationDashboardMeta['approvesFromLevel'];
    submitsToLevel?: CollationDashboardMeta['submitsToLevel'];
    route: string;
}
export declare class AuthUserDto {
    id: string;
    email: string;
    phoneNumber?: string | null;
    firstName: string;
    lastName: string;
    role?: CampaignRole;
    scopeType?: ScopeType;
    scopeId?: string;
    campaignId?: string;
    mfaEnabled: boolean;
    dashboard?: CollationDashboardDto;
}
export declare class LoginResponseDto {
    user: AuthUserDto;
    accessToken: string;
    refreshToken: string;
}
export declare class RefreshTokenResponseDto {
    accessToken: string;
    refreshToken: string;
}
export declare class RegisterResponseDto {
    id: string;
    email: string;
}
export declare class CampaignMembershipDto {
    campaignId: string;
    campaignName: string;
    role: CampaignRole;
    scopeType?: ScopeType;
    scopeId?: string;
    scopeName?: string;
    dashboard?: CollationDashboardDto;
}
export declare class SessionResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    mfaEnabled: boolean;
    memberships: CampaignMembershipDto[];
}
