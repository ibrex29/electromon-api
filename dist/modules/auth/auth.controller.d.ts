import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import type { JwtPayload } from '@electromon/shared';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, ip: string): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
    }>;
    session(user: JwtPayload): Promise<{
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
}
