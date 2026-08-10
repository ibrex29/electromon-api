export declare class CountDto {
    lgas?: number;
    wards?: number;
    pollingUnits?: number;
    volunteers?: number;
    supportGroups?: number;
    fieldReports?: number;
    campaigns?: number;
}
export declare class StateResponseDto {
    id: string;
    name: string;
    code: string;
    _count?: CountDto;
}
export declare class SenatorialDistrictDto {
    id: string;
    name: string;
}
export declare class LgaResponseDto {
    id: string;
    name: string;
    stateId: string;
    senatorialDistrict?: SenatorialDistrictDto;
    _count?: CountDto;
}
export declare class WardResponseDto {
    id: string;
    name: string;
    lgaId: string;
    latitude?: number;
    longitude?: number;
    _count?: CountDto;
}
export declare class PollingUnitResponseDto {
    id: string;
    code: string;
    name: string;
    wardId: string;
    latitude?: number;
    longitude?: number;
    status: string;
}
export declare class CoverageStatsDto {
    campaignId: string;
    state: string;
    totalLgas: number;
    totalWards: number;
    totalPollingUnits: number;
    assignedCoordinators: number;
}
export declare class CampaignListItemDto {
    id: string;
    name: string;
    slug: string;
    stateId: string;
    isActive: boolean;
    state?: StateResponseDto;
    _count?: CountDto;
}
