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
                sellerDocuments: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async approveSeller(sellerId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'seller') throw new BadRequestException('Not a Seller user');
        if (user.isApproved) throw new BadRequestException('User is already approved');

        await this.prisma.user.update({
            where: { id: sellerId },
            data: {
                isApproved: true,
                approvalStatus: 'APPROVED',
                isFirstApprovalLogin: true,
                rejectionReason: null
            }
        });

        return { message: 'Seller approved successfully' };
    }

    async rejectSeller(sellerId: number, rejectionReason?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.role !== 'seller') throw new BadRequestException('Not a Seller user');

        await this.prisma.user.update({
            where: { id: sellerId },
            data: {
                isApproved: false,
                approvalStatus: 'REJECTED',
                rejectionReason: rejectionReason || 'Invalid documents or information provided'
            }
        });

        return { message: 'Seller application rejected' };
    }
}
