import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Request } from '@nestjs/common';
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
    @RequirePermission('userManagement_add')
    create(@Body() createOperatorDto: CreateOperatorDto, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.operatorsService.create(createOperatorDto, sellerId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Operators' })
    @ApiQuery({ name: 'facilityId', required: false })
    @RequirePermission('userManagement_view')
    findAll(@Request() req: any, @Query('facilityId') facilityId?: string) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.operatorsService.findAll(facilityId, sellerId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Operator by ID' })
    @RequirePermission('userManagement_view')
    findOne(@Param('id') id: string, @Request() req: any) {
        const sellerId = req.user.role === 'SELLER' ? req.user.id : undefined;
        return this.operatorsService.findOne(id, sellerId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update Operator status' })
    @RequirePermission('userManagement_edit')
    updateStatus(@Param('id') id: string, @Body() updateOperatorStatusDto: UpdateOperatorStatusDto) {
        return this.operatorsService.updateStatus(id, updateOperatorStatusDto);
    }
}
