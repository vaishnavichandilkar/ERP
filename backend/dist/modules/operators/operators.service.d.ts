import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
export declare class OperatorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOperatorDto): Promise<{
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
    updateStatus(id: string, dto: UpdateOperatorStatusDto): Promise<{
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
    private assignPermissions;
    private formatPermissions;
}
