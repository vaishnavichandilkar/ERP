export declare class RegisterDto {
    name: string;
    email: string;
    mobile: string;
    password: string;
}
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class VerifyAdminOtpDto {
    adminId: string;
    mobile: string;
    otp: string;
}
