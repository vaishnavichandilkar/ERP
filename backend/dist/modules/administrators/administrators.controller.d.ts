import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorStatusDto } from './dto/update-administrator-status.dto';
export declare class AdministratorsController {
    private readonly administratorsService;
    constructor(administratorsService: AdministratorsService);
    create(createAdministratorDto: CreateAdministratorDto): Promise<{
        id: string;
        name: string;
        username: string;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(facilityId?: string): Promise<{
        facility: {
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
        };
        id: string;
        name: string;
        username: string;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        permissions: any;
        facility: {
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
        };
        id: string;
        name: string;
        username: string;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, updateAdministratorStatusDto: UpdateAdministratorStatusDto): Promise<{
        id: string;
        name: string;
        username: string;
        passwordHash: string | null;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
