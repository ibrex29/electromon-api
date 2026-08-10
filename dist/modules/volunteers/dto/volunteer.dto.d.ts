export declare class CreateVolunteerDto {
    campaignId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    wardId?: string;
    role?: string;
    performanceScore?: number;
    isVerified?: boolean;
}
declare const UpdateVolunteerDto_base: import("@nestjs/common").Type<Partial<CreateVolunteerDto>>;
export declare class UpdateVolunteerDto extends UpdateVolunteerDto_base {
}
export declare class ListVolunteersQueryDto {
    campaignId: string;
    wardId?: string;
    role?: string;
    isVerified?: boolean;
    search?: string;
}
export {};
