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
        // Allow updating even if profile completed? Or maybe block?
        // Prompt says "Implement create-or-update", implying we might update.
        // But original code blocked if verified.
        // "Persist only... Implement create-or-update..."
        // I will allow update but maybe reset approval status?
        // Original check: if (user.isProfileCompleted) throw...
        // If I change to upsert, I should probably remove this check or allow it.
        // Let's assume re-submission is allowed (e.g. correcting docs).

        const details = await this.prisma.businessDetail.upsert({
            where: { adminId: userId },
            update: {
                ...dto,
                // If files are re-uploaded, they replace old paths. 
                // If not, they might be undefined in 'dto' if logic was different, 
                // but here 'dto' contains whatever was passed.
                // Controller passes 'fileData' merged into dto. 
                // If a file is NOT uploaded in update, it won't be in fileData.
                // However, the DTO fields for files are 'any'.
                // If I want to partial update, I need to check what is in dto.
                // But simplified: Upsert replaces fields provided.
            },
            create: {
                adminId: userId,
                ...dto
            }
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isProfileCompleted: true,
                isApprovedBySuperAdmin: false // Reset approval on update
            }
        });

        return { message: 'Business details saved. Pending Super Admin approval.' };
    }
}
