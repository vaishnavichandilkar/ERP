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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../infrastructure/prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret') || 'secret',
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        let user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (user) {
            if (user.role === 'ADMIN') {
                const allowedStatus = ['ACTIVE', 'PENDING_PROFILE'];
                if (!allowedStatus.includes(user.status)) {
                    throw new common_1.UnauthorizedException(`Account status: ${user.status}`);
                }
            }
            return {
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status,
                isOtpVerified: user.isOtpVerified,
                isProfileCompleted: user.isProfileCompleted,
                isApprovedBySuperAdmin: user.isApprovedBySuperAdmin,
                facilityId: null,
                permissions: null,
            };
        }
        user = await this.prisma.administrator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });
        if (user) {
            if (!user.isActive)
                throw new common_1.UnauthorizedException('User inactive');
            return {
                id: user.id,
                username: user.username,
                role: 'ADMINISTRATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }
        user = await this.prisma.operator.findUnique({
            where: { id: payload.sub },
            include: { permissions: { include: { module: true } } },
        });
        if (user) {
            if (!user.isActive)
                throw new common_1.UnauthorizedException('User inactive');
            return {
                id: user.id,
                username: user.username,
                role: 'OPERATOR',
                facilityId: user.facilityId,
                permissions: this.formatPermissions(user.permissions),
            };
        }
        throw new common_1.UnauthorizedException('User not found');
    }
    formatPermissions(permissions) {
        if (!permissions)
            return {};
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
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map