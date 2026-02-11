import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otpService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, otpService: OtpService, configService: ConfigService);
    registerAdmin(dto: RegisterDto): Promise<{
        adminId: string;
        message: string;
    }>;
    verifyOtp(dto: any): Promise<{
        message: string;
        accessToken: string;
        nextStep: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            username: any;
            role: string;
            facilityId: any;
            permissions: {};
        };
    }>;
    resendOtp(dto: {
        email: string;
    }): Promise<void>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            name: any;
            username: any;
            role: string;
            facilityId: any;
            permissions: {};
        };
    }>;
    private generateTokens;
}
