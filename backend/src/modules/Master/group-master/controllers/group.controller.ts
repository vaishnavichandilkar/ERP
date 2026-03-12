import { Body, Controller, Get, Param, Patch, Post, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GroupMasterService } from '../services/group.service';
import { CreateSubGroupDto, UpdateSubGroupDto, UpdateSubGroupStatusDto } from '../dto/group-master.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Group Master')
@Controller('group-master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupMasterController {
    constructor(private readonly groupService: GroupMasterService) { }

    @Get()
    @ApiOperation({ summary: 'Get all groups with their subgroups' })
    @ApiResponse({ status: 200, description: 'List of groups with subgroups' })
    async getAllGroups() {
        return this.groupService.getAllGroupsWithSubGroups();
    }

    @Get('dropdown')
    @ApiOperation({ summary: 'Get header groups for dropdown' })
    @ApiResponse({ status: 200, description: 'List of header groups' })
    async getDropdown() {
        return this.groupService.getHeaderGroupsForDropdown();
    }

    @Post('sub-group')
    @ApiOperation({ summary: 'Create a new sub-group' })
    @ApiResponse({ status: 201, description: 'Sub-group created' })
    async createSubGroup(@Body() dto: CreateSubGroupDto) {
        return this.groupService.createSubGroup(dto);
    }

    @Put('sub-group/:id')
    @ApiOperation({ summary: 'Update an existing sub-group' })
    @ApiResponse({ status: 200, description: 'Sub-group updated' })
    async updateSubGroup(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSubGroupDto,
    ) {
        return this.groupService.updateSubGroup(id, dto);
    }

    @Patch('sub-group/:id/status')
    @ApiOperation({ summary: 'Toggle sub-group status' })
    @ApiResponse({ status: 200, description: 'Status updated' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSubGroupStatusDto,
    ) {
        return this.groupService.updateSubGroupStatus(id, dto);
    }
}
