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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let SuperAdminService = class SuperAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingAdmins() {
        return this.prisma.user.findMany({
            where: {
                role: 'ADMIN',
                status: 'PENDING_APPROVAL',
            },
            include: {
                businessDetails: true
            }
        });
    }
    async approveAdmin(adminId) {
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.role !== 'ADMIN')
            throw new common_1.BadRequestException('Not an Admin user');
        if (user.status !== 'PENDING_APPROVAL')
            throw new common_1.BadRequestException('User is not pending approval');
        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                status: 'ACTIVE',
                isActive: true,
                isApprovedBySuperAdmin: true
            }
        });
        return { message: 'Admin approved successfully' };
    }
    async rejectAdmin(adminId) {
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.role !== 'ADMIN')
            throw new common_1.BadRequestException('Not an Admin user');
        if (user.status !== 'PENDING_APPROVAL')
            throw new common_1.BadRequestException('User is not pending approval');
        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                status: 'REJECTED',
                isActive: false,
                isApprovedBySuperAdmin: false
            }
        });
        return { message: 'Admin rejected successfully' };
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuperAdminService);
//# sourceMappingURL=superadmin.service.js.map