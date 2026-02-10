import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyAdminOtpDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    registerAdmin(dto: RegisterDto): Promise<{
        adminId: string;
        accessToken: string;
    }>;
    verifyOtp(dto: VerifyAdminOtpDto): Promise<{
        message: string;
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
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
}
