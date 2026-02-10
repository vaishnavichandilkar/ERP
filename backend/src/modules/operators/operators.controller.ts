import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Operators')
@Controller('operators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class OperatorsController {
    constructor(private readonly operatorsService: OperatorsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new Operator' })
    @ApiResponse({ status: 201, description: 'Operator created successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_add permission.' })
    @ApiResponse({ status: 409, description: 'Username already exists.' })
    @RequirePermission('userManagement_add')
    create(@Body() createOperatorDto: CreateOperatorDto) {
        return this.operatorsService.create(createOperatorDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Operators' })
    @ApiQuery({ name: 'facilityId', required: false })
    @ApiResponse({ status: 200, description: 'List of operators.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' })
    @RequirePermission('userManagement_view')
    findAll(@Query('facilityId') facilityId?: string) {
        return this.operatorsService.findAll(facilityId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Operator by ID' })
    @ApiResponse({ status: 200, description: 'Operator details.' })
    @ApiResponse({ status: 404, description: 'Operator not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' })
    @RequirePermission('userManagement_view')
    findOne(@Param('id') id: string) {
        return this.operatorsService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update Operator status' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    @ApiResponse({ status: 404, description: 'Operator not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_edit permission.' })
    @RequirePermission('userManagement_edit')
    updateStatus(@Param('id') id: string, @Body() updateOperatorStatusDto: UpdateOperatorStatusDto) {
        return this.operatorsService.updateStatus(id, updateOperatorStatusDto);
    }
}
