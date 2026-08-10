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
        campaignId: string;
        wardId: string | null;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: string | null;
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: string | null;
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: string | null;
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: string | null;
        coordinatorId: string | null;
        performanceScore: number;
        isVerified: boolean;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
