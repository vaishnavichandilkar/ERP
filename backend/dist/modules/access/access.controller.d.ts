import { AccessService } from './access.service';
import { UpdateUserPermissionsDto, UpdateUserStatusDto } from './dto/access.dto';
export declare class AccessController {
    private accessService;
    constructor(accessService: AccessService);
    getAllUsers(facilityId?: string): Promise<{
        role: string;
        permissions: any;
        id: string;
        name: string;
        username: string;
        passwordHash: string | null;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserPermissions(id: string): Promise<any>;
    updateUserPermissions(id: string, dto: UpdateUserPermissionsDto): Promise<{
        message: string;
    }>;
    updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<{
        message: string;
    }>;
}
