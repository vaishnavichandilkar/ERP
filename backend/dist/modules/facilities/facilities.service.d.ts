import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, UpdateFacilityStatusDto } from './dto/facility.dto';
export declare class FacilitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateFacilityDto): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateFacilityDto): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateFacilityStatusDto): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        location: string;
        address: string;
        totalMachines: number;
        gstNumber: string | null;
        status: import(".prisma/client").$Enums.FacilityStatus;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
