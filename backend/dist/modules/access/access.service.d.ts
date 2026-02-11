import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateUserPermissionsDto, UpdateUserStatusDto } from './dto/access.dto';
export declare class AccessService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(facilityId?: string): Promise<{
        role: string;
        permissions: any;
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        passwordHash: string | null;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
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
