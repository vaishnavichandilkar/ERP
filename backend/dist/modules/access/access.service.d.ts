import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateUserPermissionsDto, UpdateUserStatusDto } from './dto/access.dto';
export declare class AccessService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getUserPermissions(userId: string): Promise<any>;
    private formatPermissions;
    updateUserPermissions(userId: string, dto: UpdateUserPermissionsDto): Promise<{
        message: string;
    }>;
    private applyAdminPermissions;
    private upsertAdminPerm;
    private applyOperatorPermissions;
    private upsertOpPerm;
    updateUserStatus(userId: string, dto: UpdateUserStatusDto): Promise<{
        message: string;
    }>;
}
