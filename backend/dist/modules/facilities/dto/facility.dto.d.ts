export declare enum FacilityStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare class CreateFacilityDto {
    name: string;
    location: string;
    address: string;
    totalMachines: number;
    gstNumber?: string;
}
export declare class UpdateFacilityDto extends CreateFacilityDto {
}
export declare class UpdateFacilityStatusDto {
    status: FacilityStatus;
}
