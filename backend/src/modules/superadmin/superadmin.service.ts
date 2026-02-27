import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SuperAdminService {
    constructor(private prisma: PrismaService) { }

    async getPendingSellers() {
        return this.prisma.user.findMany({
            where: {
                role: 'seller',
                isApproved: false,
                onboarded_at: { not: null } // Only those who finished documentation
            },
            include: {
                bankDetail: true,
                shopDetail: true,
                weighingMachineDetail: true,
                sellerDocuments: true
            }
        });
    }

    async approveSeller(sellerId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'seller') throw new BadRequestException('Not a Seller user');
        if (user.isApproved) throw new BadRequestException('User is already approved');

        await this.prisma.user.update({
            where: { id: sellerId },
            data: {
                isApproved: true,
            }
        });

        return { message: 'Seller approved successfully' };
    }

    async rejectSeller(sellerId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'seller') throw new BadRequestException('Not a Seller user');

        await this.prisma.user.update({
            where: { id: sellerId },
            data: {
                isApproved: false,
                // Optionally we could mark them as blocked or reset onboarding
            }
        });

        return { message: 'Seller application rejected' };
    }
}
