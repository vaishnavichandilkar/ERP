import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'Admin User' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'admin@weighpro.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    mobile: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: 'admin_user' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: 'admin@weighpro.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class VerifyAdminOtpDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    adminId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mobile: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    otp: string;
}
