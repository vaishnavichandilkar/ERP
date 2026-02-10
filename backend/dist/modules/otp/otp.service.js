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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let OtpService = class OtpService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async generateOtp(userId) {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.otpVerification.create({
            data: {
                userId,
                otp,
                expiresAt,
            },
        });
        console.log(`GENERATED OTP for USER ${userId}: ${otp}`);
        return otp;
    }
    async verifyOtp(userId, otp) {
        const record = await this.prisma.otpVerification.findFirst({
            where: {
                userId,
                otp,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!record) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.otpVerification.update({
            where: { id: record.id },
            data: { isUsed: true },
        });
        return true;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map