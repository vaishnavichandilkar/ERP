import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, UpdateFacilityStatusDto } from './dto/facility.dto';
export declare class FacilitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateFacilityDto): Promise<{
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
    update(id: string, dto: UpdateFacilityDto): Promise<{
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
