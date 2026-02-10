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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(dto) {
        if (dto.role === create_user_dto_1.UserRole.ADMINISTRATOR || dto.role === create_user_dto_1.UserRole.OPERATOR) {
            if (!dto.facilityId) {
                throw new common_1.BadRequestException('Facility ID is required for this role');
            }
            const facility = await this.prisma.facility.findFirst({
                where: { id: dto.facilityId, isDeleted: false }
            });
            if (!facility)
                throw new common_1.NotFoundException('Facility not found or deleted');
        }
        if (dto.role === create_user_dto_1.UserRole.ADMINISTRATOR) {
            const exists = await this.prisma.administrator.findUnique({ where: { username: dto.username } });
            if (exists)
                throw new common_1.ConflictException('Username already exists');
        }
        else if (dto.role === create_user_dto_1.UserRole.OPERATOR) {
            const exists = await this.prisma.operator.findUnique({ where: { username: dto.username } });
            if (exists)
                throw new common_1.ConflictException('Username already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const modules = await this.prisma.module.findMany();
        if (dto.role === create_user_dto_1.UserRole.ADMINISTRATOR) {
            const administrator = await this.prisma.administrator.create({
                data: {
                    name: dto.name,
                    username: dto.username,
                    passwordHash,
                    mobile: dto.mobile,
                    facilityId: dto.facilityId,
                    isActive: true,
                }
            });
            for (const mod of modules) {
                await this.prisma.administratorPermission.create({
                    data: {
                        administratorId: administrator.id,
                        moduleId: mod.id,
                        canView: false,
                        canCreate: false,
                        canUpdate: false,
                        canDelete: false
                    }
                });
            }
            return administrator;
        }
        else if (dto.role === create_user_dto_1.UserRole.OPERATOR) {
            const operator = await this.prisma.operator.create({
                data: {
                    name: dto.name,
                    username: dto.username,
                    passwordHash,
                    mobile: dto.mobile,
                    facilityId: dto.facilityId,
                    isActive: true,
                }
            });
            for (const mod of modules) {
                await this.prisma.operatorPermission.create({
                    data: {
                        operatorId: operator.id,
                        moduleId: mod.id,
                        canView: false,
                        canCreate: false,
                        canUpdate: false,
                        canDelete: false
                    }
                });
            }
            return operator;
        }
        throw new common_1.BadRequestException('Invalid Role for creation');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map