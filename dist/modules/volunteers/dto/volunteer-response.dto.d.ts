export declare class VolunteerWardLgaDto {
    id: string;
    name: string;
}
export declare class VolunteerWardDto {
    id: string;
    name: string;
    lga?: VolunteerWardLgaDto | null;
}
export declare class VolunteerResponseDto {
    id: string;
    campaignId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string | null;
    wardId?: string | null;
    ward?: VolunteerWardDto | null;
    role?: string | null;
    performanceScore: number;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
