import { CampaignRole } from '@electromon/shared';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: CampaignRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const CURRENT_USER_KEY = "currentUser";
