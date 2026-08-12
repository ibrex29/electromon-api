import { CampaignRole, ScopeType } from './enums';
export declare enum CollationLevel {
    POLLING_UNIT = "POLLING_UNIT",
    WARD = "WARD",
    LGA = "LGA",
    STATE = "STATE",
    NATIONAL = "NATIONAL"
}
export declare enum CollationResultStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare const NATIONAL_SCOPE_ID = "NGA";
export declare const COLLATION_ROLES: CampaignRole[];
/** System controllers — full read access across the campaign */
export declare const CAMPAIGN_ADMIN_ROLES: CampaignRole[];
export declare function isCampaignAdminRole(role?: CampaignRole | string | null): boolean;
/** Collation officers + campaign admins (read endpoints) */
export declare const COLLATION_READ_ROLES: CampaignRole[];
/** One role per collation level (legacy dual roles map to the same level for old rows) */
export declare const ROLE_TO_COLLATION_LEVEL: Partial<Record<CampaignRole, CollationLevel>>;
export declare const LEVEL_TO_SCOPE_TYPE: Record<CollationLevel, ScopeType>;
export declare const COLLATION_HIERARCHY: CollationLevel[];
export interface CollationDashboardMeta {
    level: CollationLevel;
    levelLabel: string;
    levelOrder: number;
    scopeType: ScopeType;
    scopeId?: string;
    scopeName?: string;
    canSubmit: boolean;
    canApprove: boolean;
    approvesFromLevel?: CollationLevel;
    submitsToLevel?: CollationLevel;
    route: string;
}
export declare function getCollationLevelForRole(role?: CampaignRole): CollationLevel | undefined;
export declare function buildDashboardMeta(role: CampaignRole, scopeType?: ScopeType, scopeId?: string | null, scopeName?: string): CollationDashboardMeta | undefined;
export declare function getParentLevel(level: CollationLevel): CollationLevel | undefined;
export declare function getChildLevel(level: CollationLevel): CollationLevel | undefined;
