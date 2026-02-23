import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Request } from '@nestjs/common';
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
    @RequirePermission('userManagement_add')
    create(@Body() createAdministratorDto: CreateAdministratorDto, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.administratorsService.create(createAdministratorDto, sellerId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Administrators' })
    @ApiQuery({ name: 'facilityId', required: false })
    @RequirePermission('userManagement_view')
    findAll(@Request() req: any, @Query('facilityId') facilityId?: string) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.administratorsService.findAll(facilityId, sellerId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Administrator by ID' })
    @RequirePermission('userManagement_view')
    findOne(@Param('id') id: string, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.administratorsService.findOne(id, sellerId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update Administrator status' })
    @RequirePermission('userManagement_edit')
    updateStatus(@Param('id') id: string, @Body() updateAdministratorStatusDto: UpdateAdministratorStatusDto) {
        // Status update logic might also need sellerId check for security
        return this.administratorsService.updateStatus(id, updateAdministratorStatusDto);
    }
}
