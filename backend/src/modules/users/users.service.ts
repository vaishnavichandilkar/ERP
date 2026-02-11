import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(dto: CreateUserDto) {
        // 0. Facility is Required for Administrator and Operator
        if (dto.role === UserRole.ADMINISTRATOR || dto.role === UserRole.OPERATOR) {
            if (!dto.facilityId) {
                throw new BadRequestException('Facility ID is required for this role');
            }
            const facility = await this.prisma.facility.findFirst({
                where: { id: dto.facilityId, isDeleted: false }
            });
            if (!facility) throw new NotFoundException('Facility not found or deleted');
        }

        // 1. Check if username exists ANYWHERE (Global Uniqueness preferred)
        // Simplified check: Check target table
        if (dto.role === UserRole.ADMINISTRATOR) {
            const exists = await this.prisma.administrator.findUnique({ where: { username: dto.username } });
            if (exists) throw new ConflictException('Username already exists');
        } else if (dto.role === UserRole.OPERATOR) {
            const exists = await this.prisma.operator.findUnique({ where: { username: dto.username } });
            if (exists) throw new ConflictException('Username already exists');
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // 3. Create Entity and Default Permissions
        const modules = await this.prisma.module.findMany();

        if (dto.role === UserRole.ADMINISTRATOR) {
            const administrator = await this.prisma.administrator.create({
                data: {
                    name: dto.name,
                    username: dto.username,
                    passwordHash,
                    mobile: dto.mobile,
                    facilityId: dto.facilityId!, // Validated above
                    isActive: true,
                }
            });

            // Assign permissions (all false by default)
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

        } else if (dto.role === UserRole.OPERATOR) {
            const operator = await this.prisma.operator.create({
                data: {
                    name: dto.name,
                    username: dto.username,
                    passwordHash,
                    mobile: dto.mobile,
                    facilityId: dto.facilityId!,
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

        throw new BadRequestException('Invalid Role for creation');
    }

}


