import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDetailsDto } from './dto/business.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin Business')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminBusinessController {
    constructor(private businessService: BusinessService) { }

    @Post('business-details')
    @ApiOperation({ summary: 'Create/Update business details' })
    @ApiResponse({ status: 201, description: 'Business details saved successfully. Pending Super Admin approval.' })
    @ApiResponse({ status: 400, description: 'User not found, OTP not verified, or Profile already completed.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    createBusinessDetails(@Request() req, @Body() dto: CreateBusinessDetailsDto) {
        return this.businessService.createBusinessDetails(req.user.id, dto);
    }
}
