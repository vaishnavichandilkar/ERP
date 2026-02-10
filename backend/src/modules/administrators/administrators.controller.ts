import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorStatusDto } from './dto/update-administrator-status.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Administrators')
@Controller('administrators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdministratorsController {
    constructor(private readonly administratorsService: AdministratorsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new Administrator' })
    @ApiResponse({ status: 201, description: 'Administrator created successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_add permission.' })
    @ApiResponse({ status: 409, description: 'Username already exists.' })
    @RequirePermission('userManagement_add')
    create(@Body() createAdministratorDto: CreateAdministratorDto) {
        return this.administratorsService.create(createAdministratorDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Administrators' })
    @ApiQuery({ name: 'facilityId', required: false })
    @ApiResponse({ status: 200, description: 'List of administrators.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' })
    @RequirePermission('userManagement_view')
    findAll(@Query('facilityId') facilityId?: string) {
        return this.administratorsService.findAll(facilityId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Administrator by ID' })
    @ApiResponse({ status: 200, description: 'Administrator details.' })
    @ApiResponse({ status: 404, description: 'Administrator not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' })
    @RequirePermission('userManagement_view')
    findOne(@Param('id') id: string) {
        return this.administratorsService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update Administrator status' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    @ApiResponse({ status: 404, description: 'Administrator not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_edit permission.' })
    @RequirePermission('userManagement_edit')
    updateStatus(@Param('id') id: string, @Body() updateAdministratorStatusDto: UpdateAdministratorStatusDto) {
        return this.administratorsService.updateStatus(id, updateAdministratorStatusDto);
    }
}
