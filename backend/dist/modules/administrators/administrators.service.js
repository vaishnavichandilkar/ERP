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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministratorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const bcrypt = require("bcrypt");
let AdministratorsService = class AdministratorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const facility = await this.prisma.facility.findUnique({ where: { id: dto.facilityId } });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        if (facility.isDeleted)
            throw new common_1.BadRequestException('Facility is deleted');
        const exists = await this.prisma.administrator.findUnique({ where: { username: dto.username } });
        if (exists)
            throw new common_1.ConflictException('Username already exists');
        const passwordHash = await bcrypt.hash(dto.password, 10);
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
        await this.assignPermissions(admin.id, dto.permissions);
        const { passwordHash: _ } = admin, result = __rest(admin, ["passwordHash"]);
        return result;
    }
    async findAll(facilityId) {
        const where = facilityId ? { facilityId } : {};
        const admins = await this.prisma.administrator.findMany({
            where,
            include: { facility: true },
            orderBy: { createdAt: 'desc' }
        });
        return admins.map(a => {
            const { passwordHash } = a, rest = __rest(a, ["passwordHash"]);
            return rest;
        });
    }
    async findOne(id) {
        const admin = await this.prisma.administrator.findUnique({
            where: { id },
            include: {
                facility: true,
                permissions: { include: { module: true } }
            }
        });
        if (!admin)
            throw new common_1.NotFoundException('Administrator not found');
        const { passwordHash } = admin, rest = __rest(admin, ["passwordHash"]);
        return Object.assign(Object.assign({}, rest), { permissions: this.formatPermissions(admin.permissions) });
    }
    async updateStatus(id, dto) {
        const admin = await this.prisma.administrator.findUnique({ where: { id } });
        if (!admin)
            throw new common_1.NotFoundException('Administrator not found');
        return this.prisma.administrator.update({
            where: { id },
            data: { isActive: dto.isActive }
        });
    }
    async assignPermissions(adminId, permissions) {
        if (!permissions)
            return;
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));
        const upsertPerm = async (modName, flags) => {
            if (moduleMap.has(modName)) {
                const moduleId = moduleMap.get(modName);
                await this.prisma.administratorPermission.create({
                    data: Object.assign({ administratorId: adminId, moduleId }, flags)
                });
            }
        };
        await upsertPerm('Facilities', {
            canCreate: permissions.facilityManagement_add,
            canView: permissions.facilityManagement_view,
            canUpdate: permissions.facilityManagement_edit,
            canDelete: permissions.facilityManagement_delete
        });
        await upsertPerm('Users', {
            canCreate: permissions.userManagement_add,
            canView: permissions.userManagement_view,
            canUpdate: permissions.userManagement_edit,
            canDelete: permissions.userManagement_delete
        });
        await upsertPerm('Products', {
            canCreate: permissions.productManagement_add,
            canView: permissions.productManagement_view,
            canUpdate: permissions.productManagement_edit,
            canDelete: permissions.productManagement_delete
        });
        await upsertPerm('Inventory', {
            canCreate: permissions.inventoryManagement_add,
            canView: permissions.inventoryManagement_view,
            canUpdate: permissions.inventoryManagement_edit,
            canDelete: permissions.inventoryManagement_delete
        });
        await upsertPerm('Billing', {
            canCreate: permissions.billing_add,
            canView: permissions.billing_view,
            canUpdate: permissions.billing_edit,
            canDelete: permissions.billing_delete
        });
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
};
exports.AdministratorsService = AdministratorsService;
exports.AdministratorsService = AdministratorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdministratorsService);
//# sourceMappingURL=administrators.service.js.map