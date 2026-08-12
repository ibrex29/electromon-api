import { CampaignService } from './campaign.service';
import type { JwtPayload } from '@electromon/shared';
export declare class CampaignController {
    private campaignService;
    constructor(campaignService: CampaignService);
    list(user: JwtPayload): import("db/dist").Prisma.PrismaPromise<({
        _count: {
            volunteers: number;
            fieldReports: number;
            supportGroups: number;
        };
        state: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        slug: string;
        clientPartyCode: string | null;
        trackedParties: import("db/dist/generated/runtime/client").JsonValue | null;
    })[]>;
    getOne(id: string): Promise<{
        state: {
            senatorialDistricts: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                stateId: string;
            }[];
            lgas: ({
                wards: ({
                    _count: {
                        pollingUnits: number;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    name: string;
                    lgaId: string;
                    updatedAt: Date;
                    registrationAreaCode: string | null;
                    latitude: number | null;
                    longitude: number | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                stateId: string;
                senatorialDistrictId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        stateId: string;
        slug: string;
        clientPartyCode: string | null;
        trackedParties: import("db/dist/generated/runtime/client").JsonValue | null;
    }>;
}
