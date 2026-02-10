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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let BusinessService = class BusinessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBusinessProfile() {
        return { name: 'WeighPro Enterprise', license: 'WP-2026-X' };
    }
    async createBusinessDetails(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (!user.isOtpVerified)
            throw new common_1.BadRequestException('OTP not verified');
        if (user.isProfileCompleted)
            throw new common_1.BadRequestException('Profile already completed');
        const details = await this.prisma.businessDetail.create({
            data: Object.assign({ adminId: userId }, dto)
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { isProfileCompleted: true }
        });
        return { message: 'Business details saved. Pending Super Admin approval.' };
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessService);
//# sourceMappingURL=business.service.js.map