import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOperatorDto, OperatorPermissionsDto } from './dto/create-operator.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OperatorsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateOperatorDto, sellerId?: string) {
        const facility = await this.prisma.facility.findFirst({
            where: {
                id: dto.facilityId,
                isDeleted: false,
                ...(sellerId ? { sellerId } : {})
            }
        });
        if (!facility) throw new NotFoundException('Facility not found or access denied');

        const exists = await this.prisma.operator.findUnique({ where: { username: dto.username } });
        if (exists) throw new ConflictException('Username already exists');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const operator = await this.prisma.operator.create({
            data: {
                name: dto.name,
                username: dto.username,
                passwordHash,
                mobile: dto.mobile,
                facilityId: dto.facilityId,
                isActive: true
            }
        });

        await this.assignPermissions(operator.id, dto.permissions);

        const { passwordHash: _, ...result } = operator;
        return result;
    }

    async findAll(facilityId?: string, sellerId?: string) {
        const where: any = {
            ...(facilityId ? { facilityId } : {}),
            ...(sellerId ? { facility: { sellerId } } : {})
        };
        const operators = await this.prisma.operator.findMany({
            where,
            include: { facility: true },
            orderBy: { createdAt: 'desc' }
        });
        return operators.map(o => {
            const { passwordHash, ...rest } = o;
            return rest;
        });
    }

    async findOne(id: string, sellerId?: string) {
        const where: any = {
            id,
            ...(sellerId ? { facility: { sellerId } } : {})
        };
        const operator = await this.prisma.operator.findFirst({
            where,
            include: {
                facility: true,
                permissions: { include: { module: true } }
            }
        });
        if (!operator) throw new NotFoundException('Operator not found or access denied');

        const { passwordHash, ...rest } = operator;
        return {
            ...rest,
            permissions: this.formatPermissions(operator.permissions)
        };
    }

    async updateStatus(id: string, dto: UpdateOperatorStatusDto) {
        const operator = await this.prisma.operator.findUnique({ where: { id } });
        if (!operator) throw new NotFoundException('Operator not found');

        return this.prisma.operator.update({
            where: { id },
            data: { isActive: dto.isActive }
        });
    }

    private async assignPermissions(operatorId: string, permissions?: OperatorPermissionsDto) {
        if (!permissions) return;

        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));

        const upsertPerm = async (modName: string, flags: any) => {
            if (moduleMap.has(modName)) {
                const moduleId = moduleMap.get(modName);
                await this.prisma.operatorPermission.create({
                    data: {
                        operatorId,
                        moduleId,
                        ...flags
                    }
                });
            }
        };

        // Map DTO to Modules
        await upsertPerm('Facilities', { canView: permissions.facilityManagement_view });
        await upsertPerm('Users', {});
        await upsertPerm('Products', { canView: permissions.productManagement_view });
        await upsertPerm('Inventory', { canView: permissions.inventoryManagement_view });
        await upsertPerm('Billing', { canView: permissions.billing_view });
        await upsertPerm('Reports', { canView: permissions.report_view });
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
