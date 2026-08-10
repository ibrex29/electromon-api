import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
        memberships: {
            id: string;
            createdAt: Date;
            userId: string;
            campaignId: string;
            updatedAt: Date;
            isActive: boolean;
            role: import("db/dist").$Enums.CampaignRole;
            scopeType: import("db/dist").$Enums.ScopeType | null;
            scopeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        passwordHash: string;
        otherNames: string | null;
        mfaEnabled: boolean;
        mfaSecret: string | null;
    }>;
}
export {};
