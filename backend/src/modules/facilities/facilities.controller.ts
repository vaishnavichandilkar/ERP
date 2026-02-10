import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
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
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_add permission.' })
    @RequirePermission('facilityManagement_add')
    create(@Body() createFacilityDto: CreateFacilityDto) {
        return this.facilitiesService.create(createFacilityDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get All Facilities' })
    @ApiResponse({ status: 200, description: 'List of facilities.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_view permission.' })
    @RequirePermission('facilityManagement_view')
    findAll() {
        return this.facilitiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'View Facility' })
    @ApiResponse({ status: 200, description: 'Facility details.' })
    @ApiResponse({ status: 404, description: 'Facility not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_view permission.' })
    @RequirePermission('facilityManagement_view')
    findOne(@Param('id') id: string) {
        return this.facilitiesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update Facility' })
    @ApiResponse({ status: 200, description: 'Facility updated successfully.' })
    @ApiResponse({ status: 404, description: 'Facility not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_edit permission.' })
    @RequirePermission('facilityManagement_edit')
    update(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto) {
        return this.facilitiesService.update(id, updateFacilityDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Activate / Deactivate' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    @ApiResponse({ status: 404, description: 'Facility not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_edit permission.' })
    @RequirePermission('facilityManagement_edit')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateFacilityStatusDto) {
        return this.facilitiesService.updateStatus(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Facility (Soft delete)' })
    @ApiResponse({ status: 200, description: 'Facility deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Facility not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires facilityManagement_delete permission.' })
    @RequirePermission('facilityManagement_delete')
    remove(@Param('id') id: string) {
        return this.facilitiesService.remove(id);
    }
}
