import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoginDto, RefreshTokenDto, SendLoginOtpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { SmsService } from '../otp/sms.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private smsService: SmsService,
    ) { }

    async sendLoginOtp(dto: SendLoginOtpDto) {
        // 1. Check if user exists in any table
        const user = await this.findUserByPhone(dto.phone);
        if (!user) throw new NotFoundException('User with this phone number not found');

        // 2. Send OTP via SMS (Generates, Sends, and Stores)
        await this.smsService.sendOtp(dto.phone);

        return { message: 'OTP sent successfully' };
    }

    async login(dto: LoginDto) {
        // 1. Verify OTP using SmsService
        const isValid = await this.smsService.verifyOtp(dto.phone, dto.otp);
        if (!isValid) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // 2. Find User and Role
        const { user, roleType } = await this.findUserAndRoleByPhone(dto.phone);
        if (!user) {
            // Cleanup anyway if user doesn't exist (though shouldn't happen here for login)
            await this.smsService.deleteOtp(dto.phone);
            throw new UnauthorizedException('User not found');
        }

        // Cleanup OTP after success
        await this.smsService.deleteOtp(dto.phone);

        // 3. Check active status
        const isActive = user.isBlocked === undefined ? (user.isActive !== false) : !user.isBlocked;
        if (!isActive) throw new UnauthorizedException('User is inactive or blocked');

        // 4. Check Seller Status
        if (user.role === 'seller') {
            if (!user.onboarded_at) {
                throw new UnauthorizedException('Onboarding incomplete. Please complete your profile.');
            }
            if (!user.isApproved) {
                throw new UnauthorizedException('Account pending Superadmin approval.');
            }
        }

        return this.generateTokens(user, roleType);
    }

    private async findUserByPhone(phone: string): Promise<any> {
        // Checks User, Administrator, or Operator tables
        let user: any = await this.prisma.user.findUnique({ where: { phone } });
        if (user) return user;

        user = await this.prisma.administrator.findFirst({ where: { mobile: phone } });
        if (user) return user;

        user = await this.prisma.operator.findFirst({ where: { mobile: phone } });
        return user;
    }

    private async findUserAndRoleByPhone(phone: string): Promise<{ user: any, roleType: string }> {
        let user: any = await this.prisma.user.findUnique({ where: { phone } });
        if (user) return { user, roleType: user.role.toUpperCase() };

        user = await this.prisma.administrator.findFirst({ where: { mobile: phone } });
        if (user) return { user, roleType: 'ADMINISTRATOR' };

        user = await this.prisma.operator.findFirst({ where: { mobile: phone } });
        if (user) return { user, roleType: 'OPERATOR' };

        return { user: null, roleType: 'UNKNOWN' };
    }

    async refresh(dto: RefreshTokenDto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });

            // 1. Check Session table for validity
            const session = await this.prisma.session.findUnique({
                where: { jti: payload.jti }
            });

            if (!session || session.isRevoked || session.expiresAt < new Date()) {
                throw new UnauthorizedException('Session expired or revoked');
            }

            // 2. Find User
            let user: any = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            let roleType = user?.role.toUpperCase();

            if (!user) {
                user = await this.prisma.administrator.findUnique({
                    where: { id: payload.sub }
                });
                roleType = 'ADMINISTRATOR';
            }
            if (!user) {
                user = await this.prisma.operator.findUnique({
                    where: { id: payload.sub }
                });
                roleType = 'OPERATOR';
            }

            if (!user) throw new UnauthorizedException('User not found');

            // 3. Generate new tokens (this will revoke the current session)
            return this.generateTokens(user, roleType);
        } catch (e) {
            if (e instanceof UnauthorizedException) throw e;
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string) {
        await this.prisma.session.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        return { message: 'Logged out successfully' };
    }

    private async generateTokens(user: any, roleType: string) {
        const jti = crypto.randomUUID();
        const username = user.email || user.phone || user.mobile || user.username;
        const payload = { sub: user.id, username, role: roleType, jti };

        const secret = this.configService.get('jwt.secret') || 'secret';
        const refreshSecret = this.configService.get('jwt.refreshSecret') || 'refreshSecret';

        const accessToken = this.jwtService.sign(payload, { secret });
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: '7d',
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // 1. Invalidate old sessions for this user (Rotate)
        await this.prisma.session.updateMany({
            where: { userId: user.id, isRevoked: false },
            data: { isRevoked: true },
        });

        // 2. Store New Session (Database Table)
        await this.prisma.session.create({
            data: {
                userId: user.id,
                userType: roleType,
                jti: jti,
                refreshTokenHash: await bcrypt.hash(refreshToken, 10),
                expiresAt: expiresAt,
            }
        });

        // 3. Save Refresh Token in User Table (As requested for Sellers/Superadmins)
        if (roleType !== 'ADMINISTRATOR' && roleType !== 'OPERATOR') {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refresh_token: refreshToken }
            });
        }

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.first_name || user.name,
                username: username,
                role: roleType,
            },
        };
    }
}
