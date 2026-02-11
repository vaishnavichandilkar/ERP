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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const otp_service_1 = require("../otp/otp.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(prisma, jwtService, otpService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.configService = configService;
    }
    async registerAdmin(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { mobile: dto.mobile },
                    { email: dto.email }
                ]
            }
        });
        if (existingUser)
            throw new common_1.ConflictException('Mobile or Email already exists');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                username: dto.mobile,
                email: dto.email,
                mobile: dto.mobile,
                passwordHash,
                role: 'ADMIN',
                status: 'PENDING_OTP',
                isOtpVerified: false,
                isProfileCompleted: false,
                isApprovedBySuperAdmin: false,
                otpVerifications: {
                    create: {
                        otp,
                        expiresAt
                    }
                }
            }
        });
        console.log(`[OTP] Sent ${otp} to ${dto.mobile}`);
        return {
            adminId: user.id,
            message: 'OTP sent successfully. Please verify OTP to proceed.'
        };
    }
    async verifyOtp(dto) {
        const { adminId, mobile, otp } = dto;
        const otpRecord = await this.prisma.otpVerification.findFirst({
            where: {
                userId: adminId,
                otp: otp,
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!otpRecord)
            throw new common_1.BadRequestException('Invalid or expired OTP');
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user || user.mobile !== mobile)
            throw new common_1.BadRequestException('Invalid User/Mobile');
        await this.prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });
        let newStatus = user.status;
        if (user.status === 'PENDING_OTP') {
            newStatus = 'PENDING_PROFILE';
        }
        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                isOtpVerified: true,
                status: newStatus
            }
        });
        const tokens = await this.generateTokens(user, 'ADMIN');
        return {
            message: 'OTP Verified. Please complete Business Profile.',
            accessToken: tokens.accessToken,
            nextStep: 'CREATE_BUSINESS_PROFILE'
        };
    }
    async login(dto) {
        let user = null;
        let roleType = 'UNKNOWN';
        user = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (user) {
            roleType = 'ADMIN';
        }
        else {
            user = await this.prisma.administrator.findUnique({
                where: { username: dto.username },
                include: { permissions: { include: { module: true } } },
            });
            if (user) {
                roleType = 'ADMINISTRATOR';
            }
            else {
                user = await this.prisma.operator.findUnique({
                    where: { username: dto.username },
                    include: { permissions: { include: { module: true } } },
                });
                if (user)
                    roleType = 'OPERATOR';
            }
        }
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('User is inactive');
        if (roleType === 'ADMIN') {
            if (user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException(`Account not active. Status: ${user.status}`);
            }
        }
        return this.generateTokens(user, roleType);
    }
    async resendOtp(dto) {
        throw new common_1.BadRequestException('Not implemented');
    }
    async logout(userId) {
        await this.prisma.session.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        return { message: 'Logged out successfully' };
    }
    async refresh(dto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            let user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            let roleType = 'ADMIN';
            if (!user) {
                user = await this.prisma.administrator.findUnique({
                    where: { id: payload.sub },
                    include: { permissions: { include: { module: true } } }
                });
                roleType = 'ADMINISTRATOR';
            }
            if (!user) {
                user = await this.prisma.operator.findUnique({
                    where: { id: payload.sub },
                    include: { permissions: { include: { module: true } } }
                });
                roleType = 'OPERATOR';
            }
            if (!user)
                throw new common_1.UnauthorizedException();
            return this.generateTokens(user, roleType);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(user, roleType) {
        const jti = crypto.randomUUID();
        const payload = { sub: user.id, username: user.username, role: roleType, jti };
        const secret = this.configService.get('jwt.secret') || 'secret';
        const refreshSecret = this.configService.get('jwt.refreshSecret') || 'refreshSecret';
        const accessToken = this.jwtService.sign(payload, { secret });
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: this.configService.get('jwt.refreshExpiration') || '7d',
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.session.create({
            data: {
                userId: user.id,
                userType: roleType,
                jti: jti,
                refreshTokenHash: await bcrypt.hash(refreshToken, 10),
                expiresAt: expiresAt,
            }
        });
        let formattedPermissions = {};
        if (roleType !== 'ADMIN' && user.permissions) {
            formattedPermissions = user.permissions.reduce((acc, curr) => {
                acc[curr.module.name] = {
                    canView: curr.canView,
                    canCreate: curr.canCreate,
                    canUpdate: curr.canUpdate,
                    canDelete: curr.canDelete
                };
                return acc;
            }, {});
        }
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: roleType,
                facilityId: user.facilityId,
                permissions: formattedPermissions,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map