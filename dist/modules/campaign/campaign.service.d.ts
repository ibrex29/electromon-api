import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CampaignService {
    private prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: string): import("db/dist").Prisma.PrismaPromise<({
        state: {
            id: string;
            createdAt: Date;
            name: string;
            code: string;
            updatedAt: Date;
        };
        _count: {
            fieldReports: number;
            volunteers: number;
            supportGroups: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        stateId: string;
        slug: string;
        clientPartyCode: string | null;
        trackedParties: import("db/dist/generated/runtime/client").JsonValue | null;
        isActive: boolean;
    })[]>;
    findById(id: string): Promise<{
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
                    latitude: number | null;
                    longitude: number | null;
                    updatedAt: Date;
                    registrationAreaCode: string | null;
                    lgaId: string;
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
            code: string;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        stateId: string;
        slug: string;
        clientPartyCode: string | null;
        trackedParties: import("db/dist/generated/runtime/client").JsonValue | null;
        isActive: boolean;
    }>;
}
