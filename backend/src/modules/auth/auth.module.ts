import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OtpModule } from '../otp/otp.module';

@Module({
    imports: [
        PassportModule,
        ConfigModule,
        OtpModule, // Import OtpModule
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.get('jwt.expiration') || '1d',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PrismaService],
    exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule { }
