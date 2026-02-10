"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AccessService = class AccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(facilityId) {
        const admins = await this.prisma.administrator.findMany({
            where: facilityId ? { facilityId } : {},
            include: { permissions: { include: { module: true } } }
        });
        const operators = await this.prisma.operator.findMany({
            where: facilityId ? { facilityId } : {},
            include: { permissions: { include: { module: true } } }
        });
        return [
            ...admins.map(a => (Object.assign(Object.assign({}, a), { role: 'ADMINISTRATOR', permissions: this.formatPermissions(a.permissions) }))),
            ...operators.map(o => (Object.assign(Object.assign({}, o), { role: 'OPERATOR', permissions: this.formatPermissions(o.permissions) })))
        ];
    }
    async getUserPermissions(userId) {
        const admin = await this.prisma.administrator.findUnique({
            where: { id: userId },
            include: { permissions: { include: { module: true } } }
        });
        if (admin)
            return this.formatPermissions(admin.permissions);
        const op = await this.prisma.operator.findUnique({
            where: { id: userId },
            include: { permissions: { include: { module: true } } }
        });
        if (op)
            return this.formatPermissions(op.permissions);
        throw new common_1.NotFoundException('User not found');
    }
    formatPermissions(permissions) {
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
    async updateUserPermissions(userId, dto) {
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
        throw new common_1.NotFoundException('User not found');
    }
    async applyAdminPermissions(userId, access) {
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));
        const updates = [];
        if (moduleMap.has('Facilities')) {
            const modId = moduleMap.get('Facilities');
            await this.upsertAdminPerm(userId, modId, {
                canCreate: access.facilityManagement_add,
                canView: access.facilityManagement_view,
                canUpdate: access.facilityManagement_edit,
                canDelete: access.facilityManagement_delete
            });
        }
        if (moduleMap.has('Users')) {
            const modId = moduleMap.get('Users');
            await this.upsertAdminPerm(userId, modId, {
                canCreate: access.userManagement_add,
                canView: access.userManagement_view,
                canUpdate: access.userManagement_edit,
                canDelete: access.userManagement_delete
            });
        }
    }
    async upsertAdminPerm(adminId, moduleId, flags) {
        const data = {};
        if (flags.canCreate !== undefined)
            data.canCreate = flags.canCreate;
        if (flags.canView !== undefined)
            data.canView = flags.canView;
        if (flags.canUpdate !== undefined)
            data.canUpdate = flags.canUpdate;
        if (flags.canDelete !== undefined)
            data.canDelete = flags.canDelete;
        if (Object.keys(data).length > 0) {
            await this.prisma.administratorPermission.upsert({
                where: { administratorId_moduleId: { administratorId: adminId, moduleId } },
                create: Object.assign({ administratorId: adminId, moduleId }, data),
                update: data
            });
        }
    }
    async applyOperatorPermissions(userId, access) {
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));
        if (moduleMap.has('Facilities')) {
            await this.upsertOpPerm(userId, moduleMap.get('Facilities'), { canView: access.facilityManagement_view });
        }
    }
    async upsertOpPerm(opId, moduleId, flags) {
        const data = {};
        if (flags.canView !== undefined)
            data.canView = flags.canView;
        if (Object.keys(data).length > 0) {
            await this.prisma.operatorPermission.upsert({
                where: { operatorId_moduleId: { operatorId: opId, moduleId } },
                create: Object.assign({ operatorId: opId, moduleId }, data),
                update: data
            });
        }
    }
    async updateUserStatus(userId, dto) {
        try {
            await this.prisma.administrator.update({ where: { id: userId }, data: { isActive: dto.isActive } });
            return { message: 'User status updated' };
        }
        catch (_a) {
            try {
                await this.prisma.operator.update({ where: { id: userId }, data: { isActive: dto.isActive } });
                return { message: 'User status updated' };
            }
            catch (_b) {
                throw new common_1.NotFoundException('User not found');
            }
        }
    }
};
exports.AccessService = AccessService;
exports.AccessService = AccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessService);
//# sourceMappingURL=access.service.js.map