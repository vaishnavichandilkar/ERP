import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [OtpService, SmsService, PrismaService],
    exports: [OtpService, SmsService],
})
export class OtpModule { }
