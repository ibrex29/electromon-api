import { JwtPayload } from '@electromon/shared';
export declare function isWardScopedUser(user: JwtPayload): boolean;
export declare function getWardScopeId(user: JwtPayload): string | undefined;
export declare function requireWardScopeId(user: JwtPayload): string;
export declare function assertWardAccess(user: JwtPayload, wardId: string): void;
export declare function assertPollingUnitInWard(prisma: {
    pollingUnit: {
        findFirst: (args: unknown) => Promise<{
            wardId: string;
        } | null>;
    };
}, pollingUnitId: string, wardId: string): Promise<void>;
