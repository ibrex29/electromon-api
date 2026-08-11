import type { JwtPayload } from '@electromon/shared';
import { CreateVolunteerDto, ListVolunteersQueryDto, UpdateVolunteerDto } from './dto/volunteer.dto';
import { VolunteersService } from './volunteers.service';
export declare class VolunteersController {
    private volunteersService;
    constructor(volunteersService: VolunteersService);
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
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        campaignId: string;
        role: string | null;
        wardId: string | null;
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
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        campaignId: string;
        role: string | null;
        wardId: string | null;
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
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        campaignId: string;
        role: string | null;
        wardId: string | null;
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
        updatedAt: Date;
        email: string | null;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        campaignId: string;
        role: string | null;
        wardId: string | null;
        coordinatorId: string | null;
        isVerified: boolean;
        performanceScore: number;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
