import { Controller, Get, UseGuards } from '@nestjs/common';
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
    getProfile() {
        return this.businessService.getBusinessProfile();
    }
}
