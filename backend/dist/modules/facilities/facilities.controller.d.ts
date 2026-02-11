import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto, UpdateFacilityDto, UpdateFacilityStatusDto } from './dto/facility.dto';
export declare class FacilitiesController {
    private readonly facilitiesService;
    constructor(facilitiesService: FacilitiesService);
    create(createFacilityDto: CreateFacilityDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }>;
    update(id: string, updateFacilityDto: UpdateFacilityDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }>;
    updateStatus(id: string, dto: UpdateFacilityStatusDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.FacilityStatus;
        updatedAt: Date;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        isDeleted: boolean;
    }>;
}
