import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(phoneNumber: string, password: string): Promise<{
        memberships: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            userId: string;
            campaignId: string;
            role: import("db/dist").$Enums.CampaignRole;
            scopeType: import("db/dist").$Enums.ScopeType | null;
            scopeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phoneNumber: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        otherNames: string | null;
        isActive: boolean;
        mfaEnabled: boolean;
        mfaSecret: string | null;
    }>;
}
export {};
