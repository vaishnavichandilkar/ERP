import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class BusinessService {
    constructor(private prisma: PrismaService) { }

    async getBusinessProfile() {
        return { name: 'WeighPro Enterprise', license: 'WP-2026-X' };
    }

    async createBusinessDetails(userId: string, dto: any) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (!user.isOtpVerified) throw new BadRequestException('OTP not verified');
        if (user.isProfileCompleted) throw new BadRequestException('Profile already completed');

        const details = await this.prisma.businessDetail.create({
            data: {
                adminId: userId,
                ...dto
            }
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { isProfileCompleted: true }
        });

        return { message: 'Business details saved. Pending Super Admin approval.' };
    }
}
