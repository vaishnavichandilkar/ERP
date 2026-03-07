import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class BusinessService {
    constructor(private prisma: PrismaService) { }

    async getBusinessProfile(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bankDetail: true,
                shopDetail: true,
                sellerDocuments: true
            }
        });
    }

    // Compatibility method for AdminBusinessController
    async createBusinessDetails(userId: number, dto: any) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        // Note: This maps the old "all-in-one" business details to the new split tables
        // In a real scenario, we'd want to use the Step-by-Step OnboardingService instead.

        await this.prisma.bankDetail.upsert({
            where: { userId },
            update: {
                bankName: dto.bankName || 'Legacy',
                accountNo: dto.accountNo || 'Legacy',
                ifsc: dto.ifsc || 'Legacy',
                holderName: user.first_name || 'Legacy',
            },
            create: {
                userId,
                bankName: dto.bankName || 'Legacy',
                accountNo: dto.accountNo || 'Legacy',
                ifsc: dto.ifsc || 'Legacy',
                holderName: user.first_name || 'Legacy',
            }
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                onboarded_at: new Date(),
                isApproved: false
            }
        });

        return { message: 'Business details saved for legacy flow.' };
    }

    async updateBusinessStatus(userId: number, isApproved: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isApproved: isApproved
            }
        });
    }
}
