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
exports.OperatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const bcrypt = require("bcrypt");
let OperatorsService = class OperatorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const facility = await this.prisma.facility.findUnique({ where: { id: dto.facilityId } });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        if (facility.isDeleted)
            throw new common_1.BadRequestException('Facility is deleted');
        const exists = await this.prisma.operator.findUnique({ where: { username: dto.username } });
        if (exists)
            throw new common_1.ConflictException('Username already exists');
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
        const { passwordHash: _ } = operator, result = __rest(operator, ["passwordHash"]);
        return result;
    }
    async findAll(facilityId) {
        const where = facilityId ? { facilityId } : {};
        const operators = await this.prisma.operator.findMany({
            where,
            include: { facility: true },
            orderBy: { createdAt: 'desc' }
        });
        return operators.map(o => {
            const { passwordHash } = o, rest = __rest(o, ["passwordHash"]);
            return rest;
        });
    }
    async findOne(id) {
        const operator = await this.prisma.operator.findUnique({
            where: { id },
            include: {
                facility: true,
                permissions: { include: { module: true } }
            }
        });
        if (!operator)
            throw new common_1.NotFoundException('Operator not found');
        const { passwordHash } = operator, rest = __rest(operator, ["passwordHash"]);
        return Object.assign(Object.assign({}, rest), { permissions: this.formatPermissions(operator.permissions) });
    }
    async updateStatus(id, dto) {
        const operator = await this.prisma.operator.findUnique({ where: { id } });
        if (!operator)
            throw new common_1.NotFoundException('Operator not found');
        return this.prisma.operator.update({
            where: { id },
            data: { isActive: dto.isActive }
        });
    }
    async assignPermissions(operatorId, permissions) {
        if (!permissions)
            return;
        const modules = await this.prisma.module.findMany();
        const moduleMap = new Map(modules.map(m => [m.name, m.id]));
        const upsertPerm = async (modName, flags) => {
            if (moduleMap.has(modName)) {
                const moduleId = moduleMap.get(modName);
                await this.prisma.operatorPermission.create({
                    data: Object.assign({ operatorId,
                        moduleId }, flags)
                });
            }
        };
        await upsertPerm('Facilities', { canView: permissions.facilityManagement_view });
        await upsertPerm('Users', {});
        await upsertPerm('Products', { canView: permissions.productManagement_view });
        await upsertPerm('Inventory', { canView: permissions.inventoryManagement_view });
        await upsertPerm('Billing', { canView: permissions.billing_view });
        await upsertPerm('Reports', { canView: permissions.report_view });
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
exports.OperatorsService = OperatorsService;
exports.OperatorsService = OperatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OperatorsService);
//# sourceMappingURL=operators.service.js.map