import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [OtpService, PrismaService],
    exports: [OtpService],
})
export class OtpModule { }
