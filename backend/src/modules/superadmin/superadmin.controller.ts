import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApproveSellerDto } from './dto/superadmin.dto';

@ApiTags('Super Admin')
@Controller('superadmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
    constructor(private superAdminService: SuperAdminService) { }

    @Get('pending-sellers')
    @ApiOperation({ summary: 'Get list of pending seller approvals' })
    @ApiResponse({ status: 200, description: 'Returns list of pending sellers.' })
    async getPendingSellers(@Request() req) {
        if (req.user.role !== 'SUPERADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.getPendingSellers();
    }

    @Get('approved-sellers')
    @ApiOperation({ summary: 'Get list of approved sellers' })
    @ApiResponse({ status: 200, description: 'Returns list of approved sellers.' })
    async getApprovedSellers(@Request() req) {
        if (req.user.role !== 'SUPERADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.getApprovedSellers();
    }

    @Get('rejected-sellers')
    @ApiOperation({ summary: 'Get list of rejected sellers' })
    @ApiResponse({ status: 200, description: 'Returns list of rejected sellers.' })
    async getRejectedSellers(@Request() req) {
        if (req.user.role !== 'SUPERADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.getRejectedSellers();
    }

    @Post('approve-seller')
    @ApiOperation({ summary: 'Approve a pending seller' })
    @ApiResponse({ status: 200, description: 'Seller approved successfully.' })
    async approveSeller(@Request() req, @Body() dto: ApproveSellerDto) {
        if (req.user.role !== 'SUPERADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.approveSeller(dto.sellerId);
    }

    @Post('reject-seller')
    @ApiOperation({ summary: 'Reject a pending seller' })
    @ApiResponse({ status: 200, description: 'Seller rejected successfully.' })
    async rejectSeller(@Request() req, @Body() dto: ApproveSellerDto) {
        if (req.user.role !== 'SUPERADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.rejectSeller(dto.sellerId, dto.rejectionReason);
    }
}
