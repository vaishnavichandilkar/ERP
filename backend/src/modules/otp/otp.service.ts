import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async generateOtp(userId: string): Promise<string> {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.otpVerification.create({
            data: {
                userId,
                otp,
                expiresAt,
            },
        });

        // In a real app, send OTP via SMS/Email here
        console.log(`GENERATED OTP for USER ${userId}: ${otp}`);

        return otp;
    }

    async verifyOtp(userId: string, otp: string): Promise<boolean> {
        const record = await this.prisma.otpVerification.findFirst({
            where: {
                userId,
                otp,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!record) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        await this.prisma.otpVerification.update({
            where: { id: record.id },
            data: { isUsed: true },
        });

        return true;
    }
}
