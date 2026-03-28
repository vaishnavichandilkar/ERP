import { Body, Controller, Get, Param, Patch, Post, Put, ParseIntPipe, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GroupMasterService } from '../services/group.service';
import { CreateGroupDto, UpdateGroupDto, UpdateGroupStatusDto } from '../dto/group-master.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Group Master')
@Controller('group-master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupMasterController {
    constructor(private readonly groupService: GroupMasterService) { }

    @Get()
    @ApiOperation({ summary: 'Get all groups in hierarchical structure' })
    @ApiResponse({ status: 200, description: 'Hierarchical list of groups' })
    async getAllGroups(@Request() req) {
        return this.groupService.getAllGroups(req.user.userId);
    }

    @Get('dropdown')
    @ApiOperation({ summary: 'Get groups for dropdown' })
    @ApiResponse({ status: 200, description: 'List of groups for dropdown' })
    async getDropdown(@Request() req) {
        return this.groupService.getDropdownGroups(req.user.userId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new group' })
    @ApiResponse({ status: 201, description: 'Group created' })
    async createGroup(@Request() req, @Body() dto: CreateGroupDto) {
        return this.groupService.createGroup(dto, req.user.userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an existing group' })
    @ApiResponse({ status: 200, description: 'Group updated' })
    async updateGroup(
        @Request() req,
        @Param('id') id: string, // Accept virtual UID string
        @Body() dto: UpdateGroupDto,
    ) {
        return this.groupService.updateGroup(id, dto, req.user.userId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Toggle group status' })
    @ApiResponse({ status: 200, description: 'Status updated' })
    async updateStatus(
        @Request() req,
        @Param('id') id: string, // Accept virtual UID string
        @Body() dto: UpdateGroupStatusDto,
    ) {
        return this.groupService.updateStatus(id, dto, req.user.userId);
    }

    @Post('import')
    @ApiOperation({ summary: 'Import groups from XLSX' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @UseInterceptors(FileInterceptor('file'))
    async importGroups(
      @UploadedFile() file: Express.Multer.File,
      @Request() req,
    ) {
      if (!file) {
        throw new BadRequestException('Excel file is required');
      }
      return this.groupService.importGroups(file.buffer, req.user.userId);
    }
}
