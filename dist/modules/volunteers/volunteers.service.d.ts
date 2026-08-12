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
        role: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string | null;
        updatedAt: Date;
        coordinatorId: string | null;
        performanceScore: number;
        isVerified: boolean;
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
        role: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string | null;
        updatedAt: Date;
        coordinatorId: string | null;
        performanceScore: number;
        isVerified: boolean;
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
        role: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string | null;
        updatedAt: Date;
        coordinatorId: string | null;
        performanceScore: number;
        isVerified: boolean;
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
        role: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string | null;
        updatedAt: Date;
        coordinatorId: string | null;
        performanceScore: number;
        isVerified: boolean;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private assertWardInJigawa;
}
