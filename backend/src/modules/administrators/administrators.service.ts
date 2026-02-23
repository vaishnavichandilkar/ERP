import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAdministratorDto, AdministratorPermissionsDto } from './dto/create-administrator.dto';
import { UpdateAdministratorStatusDto } from './dto/update-administrator-status.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdministratorsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAdministratorDto, sellerId?: string) {
        // 1. Check Facility
        const facility = await this.prisma.facility.findFirst({
            where: {
                id: dto.facilityId,
                isDeleted: false,
                ...(sellerId ? { sellerId } : {})
            }
        });
        if (!facility) throw new NotFoundException('Facility not found or access denied');

        // 2. Check Username Uniqueness (in Administrators table)
        const exists = await this.prisma.administrator.findUnique({ where: { username: dto.username } });
        if (exists) throw new ConflictException('Username already exists');

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // 4. Create Administrator
        const admin = await this.prisma.administrator.create({
            data: {
                name: dto.name,
                username: dto.username,
                passwordHash,
                mobile: dto.mobile,
                facilityId: dto.facilityId,
                isActive: true
            }
        });

        // 5. Assign Permissions
        await this.assignPermissions(admin.id, dto.permissions);

        const { passwordHash: _, ...result } = admin;
        return result;
    }

    async findAll(facilityId?: string, sellerId?: string) {
        const where: any = {
            ...(facilityId ? { facilityId } : {}),
            ...(sellerId ? { facility: { sellerId } } : {})
        };
        const admins = await this.prisma.administrator.findMany({
            where,
            include: { facility: true },
            orderBy: { createdAt: 'desc' }
        });
        return admins.map(a => {
            const { passwordHash, ...rest } = a;
            return rest;
        });
    }

    async findOne(id: string, sellerId?: string) {
        const where: any = {
            id,
            ...(sellerId ? { facility: { sellerId } } : {})
        };
        const admin = await this.prisma.administrator.findFirst({
            where,
            include: {
                facility: true,
                permissions: { include: { module: true } }
            }
        });
        if (!admin) throw new NotFoundException('Administrator not found or access denied');

        const { passwordHash, ...rest } = admin;
        return {
            ...rest,
            permissions: this.formatPermissions(admin.permissions)
        };
    }

    async updateStatus(id: string, dto: UpdateAdministratorStatusDto) {
        const admin = await this.prisma.administrator.findUnique({ where: { id } });
        if (!admin) throw new NotFoundException('Administrator not found');

        return this.prisma.administrator.update({
            where: { id },
            data: { isActive: dto.isActive }
        });
    }

    private async assignPermissions(adminId: string, permissions?: AdministratorPermissionsDto) {
        if (!permissions) return; // Or assign defaults

        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));

        // Helper to upsert permission
        const upsertPerm = async (modName: string, flags: any) => {
            if (moduleMap.has(modName)) {
                const moduleId = moduleMap.get(modName);
                await this.prisma.administratorPermission.create({
                    data: {
                        administratorId: adminId,
                        moduleId,
                        ...flags
                    }
                });
            }
        };

        // Map DTO to Modules
        // Facilities
        await upsertPerm('Facilities', {
            canCreate: permissions.facilityManagement_add,
            canView: permissions.facilityManagement_view,
            canUpdate: permissions.facilityManagement_edit,
            canDelete: permissions.facilityManagement_delete
        });
        // Users
        await upsertPerm('Users', {
            canCreate: permissions.userManagement_add,
            canView: permissions.userManagement_view,
            canUpdate: permissions.userManagement_edit,
            canDelete: permissions.userManagement_delete
        });
        // Products
        await upsertPerm('Products', {
            canCreate: permissions.productManagement_add,
            canView: permissions.productManagement_view,
            canUpdate: permissions.productManagement_edit,
            canDelete: permissions.productManagement_delete
        });
        // Inventory
        await upsertPerm('Inventory', {
            canCreate: permissions.inventoryManagement_add,
            canView: permissions.inventoryManagement_view,
            canUpdate: permissions.inventoryManagement_edit,
            canDelete: permissions.inventoryManagement_delete
        });
        // Billing
        await upsertPerm('Billing', {
            canCreate: permissions.billing_add,
            canView: permissions.billing_view,
            canUpdate: permissions.billing_edit,
            canDelete: permissions.billing_delete
        });
    }

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
}
