import { Controller, Post, Get, Body, Param, Headers, BadRequestException, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { SellerOnboardingService } from './seller-onboarding.service';
import { StartOnboardingDto } from './dto/seller-onboarding.dto';

@ApiTags('Seller Onboarding Session')
@Controller('seller/onboarding')
export class SellerOnboardingController {
    constructor(private readonly onboardingService: SellerOnboardingService) { }

    @Post('start')
    @ApiOperation({ summary: 'Start a new seller onboarding session' })
    @ApiBody({ type: StartOnboardingDto })
    async startOnboarding(@Body() body: StartOnboardingDto) {
        if (!body.userId) {
            throw new BadRequestException('userId is required');
        }
        return this.onboardingService.startOnboarding(body.userId);
    }

    @Get('status')
    @ApiOperation({ summary: 'Get current onboarding status/session state' })
    @ApiHeader({ name: 'x-session-id', required: false, description: 'The current onboarding session ID' })
    @ApiHeader({ name: 'x-user-id', required: false, description: 'Fallback to check by User ID if session ID is not present' })
    @ApiQuery({ name: 'userId', required: false, description: 'Check via URL Query parameter' })
    async getStatus(@Headers() headers: any, @Query('userId') userIdQuery?: string, @Query('sessionId') sessionIdQuery?: string) {
        // Express/Nest lowercases all header keys automatically
        const sessionId = sessionIdQuery || headers['x-session-id'] || headers['X-Session-ID'];
        const userIdHeader = headers['x-user-id'];
        const userId = userIdQuery || userIdHeader;

        if (!userId) {
            if (sessionId) return this.onboardingService.getStatusBySession(sessionId);
            throw new BadRequestException('userId or x-session-id is required');
        }
        return this.onboardingService.getStatusByUser(userId);
    }

    @Post('step/:stepNumber')
    @ApiOperation({ summary: 'Submit data for an onboarding step' })
    @ApiHeader({ name: 'x-session-id', required: true, description: 'The current onboarding session ID' })
    @ApiBody({ schema: { type: 'object', additionalProperties: true } })
    async submitStep(
        @Param('stepNumber', ParseIntPipe) stepNumber: number,
        @Headers() headers: any,
        @Body() body: any,
        @Query('sessionId') sessionIdQuery?: string
    ) {
        const sessionId = sessionIdQuery || headers['x-session-id'] || headers['X-Session-ID'];
        if (!sessionId) {
            throw new BadRequestException('x-session-id header is required');
        }
        return this.onboardingService.submitStep(sessionId, stepNumber, body);
    }
}
