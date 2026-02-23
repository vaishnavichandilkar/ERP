import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
    constructor(private businessService: BusinessService) { }

    @Get('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get business profile' })
    @ApiResponse({ status: 200, description: 'Returns business profile information.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    getProfile(@Request() req) {
        return this.businessService.getBusinessProfile(req.user.userId);
    }

    @Post('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create/Update business profile' })
    @ApiResponse({ status: 201, description: 'Business profile created. Account pending approval.' })
    createProfile(@Body() dto: any, @Request() req) {
        return this.businessService.createBusinessDetails(req.user.userId, dto);
    }
}
