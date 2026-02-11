import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private otpService: OtpService,
        private configService: ConfigService,
    ) { }

    async registerAdmin(dto: RegisterDto) {
        // Validate inputs (mobile unique)
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { mobile: dto.mobile },
                    { email: dto.email }
                ]
            }
        });
        if (existingUser) throw new ConflictException('Mobile or Email already exists');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // Create Admin with Status PENDING_OTP
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                username: dto.mobile,
                email: dto.email,
                mobile: dto.mobile,
                passwordHash,
                role: 'ADMIN',
                status: 'PENDING_OTP', // Set initial status
                isOtpVerified: false,
                isProfileCompleted: false,
                isApprovedBySuperAdmin: false,
                // isActive: false, // Default is true in schema, but status governs login now.
                otpVerifications: {
                    create: {
                        otp,
                        expiresAt
                    }
                }
            }
        });

        // Send OTP (Mock)
        console.log(`[OTP] Sent ${otp} to ${dto.mobile}`);

        // DO NOT generate token here based on requirement: "Login must NOT be allowed yet"
        // Return ID for next step (verify-otp)

        return {
            adminId: user.id,
            message: 'OTP sent successfully. Please verify OTP to proceed.'
        };
    }

    async verifyOtp(dto: any) {
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

        if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user || user.mobile !== mobile) throw new BadRequestException('Invalid User/Mobile');

        // Mark OTP as used
        await this.prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        // Advance Status
        let newStatus = user.status;
        if (user.status === 'PENDING_OTP') {
            newStatus = 'PENDING_PROFILE';
        }

        // Update User
        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                isOtpVerified: true,
                status: newStatus
            }
        });

        // Generate Token to allow Profile Creation
        // This token is valid but Login endpoint blocks regular login.
        // Frontend uses this token to call POST /business/profile
        const tokens = await this.generateTokens(user, 'ADMIN');

        return {
            message: 'OTP Verified. Please complete Business Profile.',
            accessToken: tokens.accessToken,
            nextStep: 'CREATE_BUSINESS_PROFILE'
        };
    }

    async login(dto: LoginDto) {
        let user: any = null;
        let roleType = 'UNKNOWN';

        // 1. Check System User (ADMIN)
        user = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        if (user) {
            roleType = 'ADMIN';
        } else {
            // 2. Check Administrator
            user = await this.prisma.administrator.findUnique({
                where: { username: dto.username },
                include: { permissions: { include: { module: true } } },
            });
            if (user) {
                roleType = 'ADMINISTRATOR';
            } else {
                // 3. Check Operator
                user = await this.prisma.operator.findUnique({
                    where: { username: dto.username },
                    include: { permissions: { include: { module: true } } },
                });
                if (user) roleType = 'OPERATOR';
            }
        }

        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Check password
        if (!user.passwordHash) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        if (!user.isActive) throw new UnauthorizedException('User is inactive');

        // NEW: Check Admin Status
        if (roleType === 'ADMIN') {
            if (user.status !== 'ACTIVE') {
                // Throw forbidden with specific status so frontend knows what to do?
                // Requirement: "Admin login must be blocked until... Super Admin approval"
                throw new UnauthorizedException(`Account not active. Status: ${user.status}`);
            }
        }

        return this.generateTokens(user, roleType);
    }

    async resendOtp(dto: { email: string }) {
        throw new BadRequestException('Not implemented');
    }

    async logout(userId: string) {
        await this.prisma.session.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        return { message: 'Logged out successfully' };
    }

    async refresh(dto: RefreshTokenDto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });

            // We need to know where to look. Payload usually has role/type.
            // If we didn't store type in payload sub, we have disjoint id space or collisions.
            // UUIDs collide rarely but we need to know table.
            // Let's assume we encoded role in payload or check tables.
            // Simplest: Check all 3.

            let user: any = await this.prisma.user.findUnique({ where: { id: payload.sub } });
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

            if (!user) throw new UnauthorizedException();

            return this.generateTokens(user, roleType);
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private async generateTokens(user: any, roleType: string) {
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

        // Store Session in generic Session table
        await this.prisma.session.create({
            data: {
                userId: user.id,
                userType: roleType,
                jti: jti,
                refreshTokenHash: await bcrypt.hash(refreshToken, 10),
                expiresAt: expiresAt,
            }
        });

        // Format Permissions for Frontend
        // Admin: All access (frontend handles this logic usually, or we verify)
        // Administrator/Operator: Map permissions list
        let formattedPermissions = {};
        if (roleType !== 'ADMIN' && user.permissions) {
            // array of objects { module: {name}, canView: bool... }
            // convert to map: { "Dashboard": { canView: true... } }
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
}


