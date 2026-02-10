import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class OtpService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateOtp(userId: string): Promise<string>;
    verifyOtp(userId: string, otp: string): Promise<boolean>;
}
