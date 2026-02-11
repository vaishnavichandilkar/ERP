import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SuperAdminService {
    constructor(private prisma: PrismaService) { }

    async getPendingAdmins() {
        return this.prisma.user.findMany({
            where: {
                role: 'ADMIN',
                status: 'PENDING_APPROVAL',
            },
            include: {
                businessDetails: true
            }
        });
    }

    async approveAdmin(adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'ADMIN') throw new BadRequestException('Not an Admin user');
        if (user.status !== 'PENDING_APPROVAL') throw new BadRequestException('User is not pending approval');

        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                status: 'ACTIVE',
                isActive: true,
                isApprovedBySuperAdmin: true
            }
        });

        return { message: 'Admin approved successfully' };
    }

    async rejectAdmin(adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'ADMIN') throw new BadRequestException('Not an Admin user');
        if (user.status !== 'PENDING_APPROVAL') throw new BadRequestException('User is not pending approval');

        await this.prisma.user.update({
            where: { id: adminId },
            data: {
                status: 'REJECTED',
                isActive: false,
                isApprovedBySuperAdmin: false
            }
        });

        return { message: 'Admin rejected successfully' };
    }
}
