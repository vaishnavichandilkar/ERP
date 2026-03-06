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
        if (!user) throw new NotFoundException('This phone number is not registered. Please sign up or try a different number.');

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
            await this.smsService.deleteOtp(dto.phone);
            throw new UnauthorizedException('User not found');
        }

        // 3. Strict Seller Verification (As per DB requirements)
        if (roleType === 'SELLER') {
            if (!user.verified) {
                throw new UnauthorizedException('Phone number not verified.');
            }
            if (user.isBlocked) {
                throw new UnauthorizedException('Account is blocked. Please contact support.');
            }
        }

        // Cleanup OTP after success
        await this.smsService.deleteOtp(dto.phone);

        // 5. Generate tokens and manage session in DB
        return this.generateTokens(user, roleType);
    }

    private async findUserByPhone(phone: string): Promise<any> {
        return this.prisma.user.findUnique({ where: { phone } });
    }

    private async findUserAndRoleByPhone(phone: string): Promise<{ user: any, roleType: string }> {
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (user) return { user, roleType: user.role.toUpperCase() };
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

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.first_name || user.name,
                username: username,
                role: roleType,
                approvalStatus: user.approvalStatus,
                isFirstApprovalLogin: user.isFirstApprovalLogin,
            },
        };
    }
    async markApprovalLoginSeen(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isFirstApprovalLogin: false }
        });
        return { message: 'Approval login screen marked as seen' };
    }
}
