import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret') || 'secret',
        });
    }

    async validate(payload: any) {
        // 1. Check User (System Admin)
        let user: any = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (user) {
            // Check Status for Admin
            if (user.role === 'ADMIN') {
                const allowedStatus = ['ACTIVE', 'PENDING_PROFILE'];
                if (!allowedStatus.includes(user.status)) {
                    throw new UnauthorizedException(`Account status: ${user.status}`);
                }
            }

            return {
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status, // Pass status to request user
                isOtpVerified: user.isOtpVerified,
                isProfileCompleted: user.isProfileCompleted,
                isApprovedBySuperAdmin: user.isApprovedBySuperAdmin,
                facilityId: null,
                permissions: null, // Admin has all
            };
        }

        // 2. Check Administrator
        user = await this.prisma.administrator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });

        if (user) {
            if (!user.isActive) throw new UnauthorizedException('User inactive');
            return {
                id: user.id,
                username: user.username,
                role: 'ADMINISTRATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }

        // 3. Check Operator
        user = await this.prisma.operator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });

        if (user) {
            if (!user.isActive) throw new UnauthorizedException('User inactive');
            return {
                id: user.id,
                username: user.username,
                role: 'OPERATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }

        throw new UnauthorizedException('User not found');
    }

    private formatPermissions(permissions: any[]) {
        if (!permissions) return {};
        // Convert to optimized map for Guard: { "Module": { view: true, ... } }
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
}

