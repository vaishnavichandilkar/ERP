import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SuperAdminService {
    constructor(private prisma: PrismaService) { }

    async getPendingAdmins() {
        return this.prisma.user.findMany({
            where: {
                role: 'ADMIN',
                isProfileCompleted: true,
                isApprovedBySuperAdmin: false
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

        await this.prisma.user.update({
            where: { id: adminId },
            data: { isApprovedBySuperAdmin: true }
        });

        // Optionally send email notification?
        return { message: 'Admin approved successfully' };
    }
}
