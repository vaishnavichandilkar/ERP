import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { UpdateUserPermissionsDto, UpdateUserStatusDto } from './dto/access.dto';

@ApiTags('Access Management')
@Controller('access')
export class AccessController {
    constructor(private accessService: AccessService) { }

    @Get('users')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'List all users' })
    @ApiQuery({ name: 'facilityId', required: false })
    @ApiResponse({ status: 200, description: 'List of all users.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires manage_access permission.' })
    @RequirePermission('manage_access') // Admin only
    getAllUsers(@Query('facilityId') facilityId?: string) {
        return this.accessService.getAllUsers(facilityId);
    }

    @Get('users/:id/permissions')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'View user permissions' })
    @ApiResponse({ status: 200, description: 'User permissions details.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires manage_access permission.' })
    @RequirePermission('manage_access') // Admin only
    getUserPermissions(@Param('id') id: string) {
        return this.accessService.getUserPermissions(id);
    }

    @Patch('users/:id/permissions')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Update user permissions' })
    @ApiResponse({ status: 200, description: 'Permissions updated successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires manage_access permission.' })
    @RequirePermission('manage_access') // Admin only
    updateUserPermissions(@Param('id') id: string, @Body() dto: UpdateUserPermissionsDto) {
        return this.accessService.updateUserPermissions(id, dto);
    }

    @Patch('users/:id/status')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Activate/Deactivate user' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires manage_access permission.' })
    @RequirePermission('manage_access') // Admin only
    updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
        return this.accessService.updateUserStatus(id, dto);
    }
}

