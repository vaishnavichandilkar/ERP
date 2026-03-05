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
        // 1. Strict Session Validation (Matching Session ID in DB)
        const session = await this.prisma.session.findUnique({
            where: { jti: payload.jti }
        });

        if (!session || session.isRevoked || session.expiresAt < new Date()) {
            throw new UnauthorizedException('Session expired or revoked. Please log in again.');
        }

        // 2. Fetch User and check status
        if (payload.role === 'ADMINISTRATOR') {
            const user = await this.prisma.administrator.findUnique({
                where: { id: payload.sub },
                include: { permissions: { include: { module: true } } },
            });
            if (!user || user.isActive === false) throw new UnauthorizedException('Account inactive or not found');
            return {
                id: user.id,
                userId: user.id,
                username: user.username,
                role: 'ADMINISTRATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }

        if (payload.role === 'OPERATOR') {
            const user = await this.prisma.operator.findUnique({
                where: { id: payload.sub },
                include: { permissions: { include: { module: true } } },
            });
            if (!user || user.isActive === false) throw new UnauthorizedException('Account inactive or not found');
            return {
                id: user.id,
                userId: user.id,
                username: user.username,
                role: 'OPERATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }

        // Default: Platform User (Superadmin, Seller, Buyer)
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || user.isBlocked) {
            throw new UnauthorizedException('Account blocked or not found');
        }

        return {
            id: user.id,
            userId: user.id,
            username: user.phone || user.email,
            role: user.role.toUpperCase(),
            isApproved: user.isApproved,
            approvalStatus: user.approvalStatus || 'PENDING',
            rejectionReason: user.rejectionReason,
            isFirstApprovalLogin: user.isFirstApprovalLogin,
            onboarded: !!user.onboarded_at,
        };
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
