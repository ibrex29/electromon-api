import { JwtPayload } from '@electromon/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVolunteerDto, ListVolunteersQueryDto, UpdateVolunteerDto } from './dto/volunteer.dto';
export declare class VolunteersService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    private assertCampaignAccess;
    list(user: JwtPayload, query: ListVolunteersQueryDto): Promise<({
        ward: {
            id: string;
            name: string;
            lga: {
                id: string;
                name: string;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        wardId: string | null;
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        role: string | null;
        coordinatorId: string | null;
        isVerified: boolean;
        performanceScore: number;
    })[]>;
    findOne(user: JwtPayload, id: string): Promise<{
        ward: {
            id: string;
            name: string;
            lga: {
                id: string;
                name: string;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        wardId: string | null;
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        role: string | null;
        coordinatorId: string | null;
        isVerified: boolean;
        performanceScore: number;
    }>;
    create(user: JwtPayload, dto: CreateVolunteerDto): Promise<{
        ward: {
            id: string;
            name: string;
            lga: {
                id: string;
                name: string;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        wardId: string | null;
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        role: string | null;
        coordinatorId: string | null;
        isVerified: boolean;
        performanceScore: number;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateVolunteerDto): Promise<{
        ward: {
            id: string;
            name: string;
            lga: {
                id: string;
                name: string;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        wardId: string | null;
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        role: string | null;
        coordinatorId: string | null;
        isVerified: boolean;
        performanceScore: number;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private assertWardInJigawa;
}
