import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyAdminOtpDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register-admin')
    @ApiOperation({ summary: 'Register a new Admin/Business user' })
    @ApiResponse({ status: 201, description: 'Admin registered successfully. Returns adminId and temporary token.' })
    @ApiResponse({ status: 409, description: 'Mobile or Email already exists.' })
    registerAdmin(@Body() dto: RegisterDto) {
        return this.authService.registerAdmin(dto);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify Admin OTP' })
    @ApiResponse({ status: 201, description: 'OTP verified successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
    verifyOtp(@Body() dto: VerifyAdminOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 201, description: 'Login successful. Returns access and refresh tokens.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials or inactive user.' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 201, description: 'Token refresh successful.' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 201, description: 'Logged out successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    logout(@Request() req) {
        return this.authService.logout(req.user.userId);
    }

    @Get('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Returns current user profile.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    getProfile(@Request() req) {
        return req.user;
    }
}
