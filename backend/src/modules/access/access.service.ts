import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateUserPermissionsDto, UpdateUserStatusDto } from './dto/access.dto';

@Injectable()
export class AccessService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers(facilityId?: string) {
        // Fetch Administrators
        const admins = await this.prisma.administrator.findMany({
            where: facilityId ? { facilityId } : {},
            include: { permissions: { include: { module: true } } }
        });

        // Fetch Operators
        const operators = await this.prisma.operator.findMany({
            where: facilityId ? { facilityId } : {},
            include: { permissions: { include: { module: true } } }
        });

        // Combine and format
        return [
            ...admins.map(a => ({ ...a, role: 'ADMINISTRATOR', permissions: this.formatPermissions(a.permissions) })),
            ...operators.map(o => ({ ...o, role: 'OPERATOR', permissions: this.formatPermissions(o.permissions) }))
        ];
    }

    async getUserPermissions(userId: string) {
        // Try Administrator
        const admin = await this.prisma.administrator.findUnique({
            where: { id: userId },
            include: { permissions: { include: { module: true } } }
        });
        if (admin) return this.formatPermissions(admin.permissions);

        // Try Operator
        const op = await this.prisma.operator.findUnique({
            where: { id: userId },
            include: { permissions: { include: { module: true } } }
        });
        if (op) return this.formatPermissions(op.permissions);

        throw new NotFoundException('User not found');
    }

    // Helper to format permissions list to object
    private formatPermissions(permissions: any[]) {
        return permissions.reduce((acc, curr) => {
            acc[curr.module.name] = {
                canView: curr.canView,
                canCreate: curr.canCreate,
                canUpdate: curr.canUpdate,
                canDelete: curr.canDelete
            };
            return acc;
        }, {});
    }

    async updateUserPermissions(userId: string, dto: UpdateUserPermissionsDto) {
        // Identify User Type
        const admin = await this.prisma.administrator.findUnique({ where: { id: userId } });
        if (admin) {
            if (dto.administratorAccess) {
                await this.applyAdminPermissions(userId, dto.administratorAccess);
            }
            return { message: 'Permissions updated' };
        }

        const op = await this.prisma.operator.findUnique({ where: { id: userId } });
        if (op) {
            if (dto.operatorAccess) {
                await this.applyOperatorPermissions(userId, dto.operatorAccess);
            }
            return { message: 'Permissions updated' };
        }

        throw new NotFoundException('User not found');
    }

    private async applyAdminPermissions(userId: string, access: any) {
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));

        // Mapping DTO keys to Module Names and Actions
        // This is tedious but necessary to bridge Phase 1 DTO to Phase 2 Schema
        // Example: facilityManagement_add -> Module "Facilities", canCreate=true

        const updates = [];

        // Define mapping logic... 
        // For brevity and robustness, we assume "Facilities" module exists.
        // We iterate the Access Object keys.

        // Facility
        if (moduleMap.has('Facilities')) {
            const modId = moduleMap.get('Facilities');
            await this.upsertAdminPerm(userId, modId, {
                canCreate: access.facilityManagement_add,
                canView: access.facilityManagement_view,
                canUpdate: access.facilityManagement_edit,
                canDelete: access.facilityManagement_delete
            });
        }

        // Users
        if (moduleMap.has('Users')) {
            const modId = moduleMap.get('Users');
            await this.upsertAdminPerm(userId, modId, {
                canCreate: access.userManagement_add,
                canView: access.userManagement_view,
                canUpdate: access.userManagement_edit,
                canDelete: access.userManagement_delete
            });
        }
        // ... Add others as needed (Products, Inventory, Billing)
        // Ensure Seed has 'Products', 'Inventory'
    }

    private async upsertAdminPerm(adminId: string, moduleId: string, flags: any) {
        // Only update provided flags (undefined means no change, but here DTO has booleans)
        // We construct update object filtering undefined
        const data: any = {};
        if (flags.canCreate !== undefined) data.canCreate = flags.canCreate;
        if (flags.canView !== undefined) data.canView = flags.canView;
        if (flags.canUpdate !== undefined) data.canUpdate = flags.canUpdate;
        if (flags.canDelete !== undefined) data.canDelete = flags.canDelete;

        if (Object.keys(data).length > 0) {
            await this.prisma.administratorPermission.upsert({
                where: { administratorId_moduleId: { administratorId: adminId, moduleId } },
                create: { administratorId: adminId, moduleId, ...data },
                update: data
            });
        }
    }

    private async applyOperatorPermissions(userId: string, access: any) {
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));

        if (moduleMap.has('Facilities')) {
            await this.upsertOpPerm(userId, moduleMap.get('Facilities'), { canView: access.facilityManagement_view });
        }
        // ... others
    }

    private async upsertOpPerm(opId: string, moduleId: string, flags: any) {
        const data: any = {};
        if (flags.canView !== undefined) data.canView = flags.canView;

        if (Object.keys(data).length > 0) {
            await this.prisma.operatorPermission.upsert({
                where: { operatorId_moduleId: { operatorId: opId, moduleId } },
                create: { operatorId: opId, moduleId, ...data },
                update: data
            });
        }
    }

    async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
        // Check Admin
        try {
            await this.prisma.administrator.update({ where: { id: userId }, data: { isActive: dto.isActive } });
            return { message: 'User status updated' };
        } catch {
            try {
                await this.prisma.operator.update({ where: { id: userId }, data: { isActive: dto.isActive } });
                return { message: 'User status updated' };
            } catch {
                throw new NotFoundException('User not found');
            }
        }
    }
}

