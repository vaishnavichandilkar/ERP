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
        // 1. Check User (Platform users: superadmin, seller, buyer)
        let user: any = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (user) {
            // Sellers can login IF they started onboarding, but their access is limited by Guards
            // Exception: If they are blocked
            if (user.isBlocked) throw new UnauthorizedException('Account is blocked');

            return {
                id: user.id,
                userId: user.id, // Providing both for compatibility
                username: user.phone || user.email,
                role: user.role.toUpperCase(),
                isApproved: user.isApproved,
                onboarded: !!user.onboarded_at,
                facilityId: null,
                permissions: null,
            };
        }

        // 2. Check Administrator (Facility user)
        user = await this.prisma.administrator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });

        if (user) {
            if (!user.isActive) throw new UnauthorizedException('User inactive');
            return {
                id: user.id,
                userId: user.id,
                username: user.username,
                role: 'ADMINISTRATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }

        // 3. Check Operator (Facility user)
        user = await this.prisma.operator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });

        if (user) {
            if (!user.isActive) throw new UnauthorizedException('User inactive');
            return {
                id: user.id,
                userId: user.id,
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
