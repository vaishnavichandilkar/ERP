import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto, UpdateFacilityDto, UpdateFacilityStatusDto } from './dto/facility.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Facilities')
@Controller('facilities')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create Facility' })
    @ApiResponse({ status: 201, description: 'Facility created successfully.' })
    @RequirePermission('facilityManagement_add')
    create(@Body() createFacilityDto: CreateFacilityDto, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : createFacilityDto.sellerId;
        if (!sellerId) throw new ForbiddenException('Seller ID is required');
        return this.facilitiesService.create(createFacilityDto, sellerId);
    }

    @Get()
    @ApiOperation({ summary: 'Get All Facilities' })
    @ApiResponse({ status: 200, description: 'List of facilities.' })
    @RequirePermission('facilityManagement_view')
    findAll(@Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.facilitiesService.findAll(sellerId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'View Facility' })
    @ApiResponse({ status: 200, description: 'Facility details.' })
    @RequirePermission('facilityManagement_view')
    findOne(@Param('id') id: string, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.facilitiesService.findOne(id, sellerId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update Facility' })
    @ApiResponse({ status: 200, description: 'Facility updated successfully.' })
    @RequirePermission('facilityManagement_edit')
    update(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.facilitiesService.update(id, updateFacilityDto, sellerId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Activate / Deactivate' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    @RequirePermission('facilityManagement_edit')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateFacilityStatusDto, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.facilitiesService.updateStatus(id, dto, sellerId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Facility (Soft delete)' })
    @ApiResponse({ status: 200, description: 'Facility deleted successfully.' })
    @RequirePermission('facilityManagement_delete')
    remove(@Param('id') id: string, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.facilitiesService.remove(id, sellerId);
    }
}
