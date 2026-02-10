import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApproveAdminDto } from './dto/superadmin.dto';

@ApiTags('Super Admin')
@Controller('superadmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
    constructor(private superAdminService: SuperAdminService) { }

    @Get('pending-admins')
    @ApiOperation({ summary: 'Get list of pending admin approvals' })
    @ApiResponse({ status: 200, description: 'Returns list of pending admins.' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only Super Admin can access.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getPendingAdmins(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.getPendingAdmins();
    }

    @Post('approve-admin')
    @ApiOperation({ summary: 'Approve a pending admin' })
    @ApiResponse({ status: 200, description: 'Admin approved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only Super Admin can access.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async approveAdmin(@Request() req, @Body() dto: ApproveAdminDto) {
        if (req.user.role !== 'SUPER_ADMIN') throw new ForbiddenException('Only Super Admin can access this resource');
        if (!dto.adminId) throw new ForbiddenException('adminId is required');
        return this.superAdminService.approveAdmin(dto.adminId);
    }
}
