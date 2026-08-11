import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScopeResolverService } from '../../common/collation/scope-resolver.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private scopeResolver;
    constructor(prisma: PrismaService, jwtService: JwtService, scopeResolver: ScopeResolverService);
    validateUser(phoneNumber: string, password: string): Promise<{
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
    login(dto: LoginDto, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            firstName: string;
            lastName: string;
            role: import("db/dist").$Enums.CampaignRole;
            scopeType: import("db/dist").$Enums.ScopeType | null;
            scopeId: string | null;
            campaignId: string;
            mfaEnabled: boolean;
            dashboard: import("@electromon/shared").CollationDashboardMeta | undefined;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        phoneNumber: string | null;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    getSession(userId: string): Promise<{
        id: string;
        email: string;
        phoneNumber: string | null;
        firstName: string;
        lastName: string;
        mfaEnabled: boolean;
        memberships: {
            campaignId: string;
            campaignName: string;
            role: import("db/dist").$Enums.CampaignRole;
            scopeType: import("db/dist").$Enums.ScopeType | null;
            scopeId: string | null;
            scopeName: string | undefined;
            dashboard: import("@electromon/shared").CollationDashboardMeta | undefined;
        }[];
    }>;
    private generateTokens;
    private recordAuthActivity;
}
