import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorStatusDto } from './dto/update-administrator-status.dto';
export declare class AdministratorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAdministratorDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
    }>;
    findAll(facilityId?: string): Promise<{
        facility: {
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
        };
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
    }[]>;
    findOne(id: string): Promise<{
        permissions: any;
        facility: {
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
        };
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
    }>;
    updateStatus(id: string, dto: UpdateAdministratorStatusDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        passwordHash: string | null;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
    }>;
    private assignPermissions;
    private formatPermissions;
}
