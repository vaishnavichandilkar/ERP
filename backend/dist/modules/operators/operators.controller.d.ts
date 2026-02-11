import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
export declare class OperatorsController {
    private readonly operatorsService;
    constructor(operatorsService: OperatorsService);
    create(createOperatorDto: CreateOperatorDto): Promise<{
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
    updateStatus(id: string, updateOperatorStatusDto: UpdateOperatorStatusDto): Promise<{
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
}
