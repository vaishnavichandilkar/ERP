import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) {}

    async getProfileByPhone(phoneNumber: string) {
        const profile = await this.prisma.userProfile.findUnique({
            where: { phone_number: phoneNumber },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found for this phone number');
        }

        return {
            name: profile.name,
            email: profile.email,
            phone_number: profile.phone_number,
            profile_image: profile.profile_image,
        };
    }

    async updateProfileImage(phoneNumber: string, imagePath: string) {
        return this.prisma.userProfile.upsert({
            where: { phone_number: phoneNumber },
            update: { profile_image: imagePath },
            create: {
                phone_number: phoneNumber,
                profile_image: imagePath,
            },
        });
    }
}
