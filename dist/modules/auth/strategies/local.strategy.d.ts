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
            userId: string;
            campaignId: string;
            role: import("db/dist").$Enums.CampaignRole;
            scopeId: string | null;
            isActive: boolean;
            scopeType: import("db/dist").$Enums.ScopeType | null;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        email: string;
        isActive: boolean;
        updatedAt: Date;
        passwordHash: string;
        otherNames: string | null;
        mfaEnabled: boolean;
        mfaSecret: string | null;
    }>;
}
export {};
