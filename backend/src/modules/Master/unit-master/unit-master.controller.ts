import { Controller, Get, Post, Body, Put, Patch, Delete, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitMasterService } from './unit-master.service';
import { CreateUnitDto, UpdateUnitDto, UpdateUnitStatusDto, UnitQueryDto } from './dto/unit-master.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Unit Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnitMasterController {
    constructor(private readonly service: UnitMasterService) { }

    @Get('gst-uom')
    @ApiOperation({ summary: 'Get all GST UOM codes' })
    getGstUomList() {
        return this.service.getGstUomList();
    }

    @Post('unit')
    @ApiOperation({ summary: 'Create a new unit' })
    createUnit(@Body() dto: CreateUnitDto) {
        return this.service.createUnit(dto);
    }

    @Get('unit')
    @ApiOperation({ summary: 'Get list of units with filters' })
    getUnitsList(@Query() query: UnitQueryDto) {
        return this.service.getUnitsList(query);
    }

    @Get('unit/:id')
    @ApiOperation({ summary: 'Get unit details by ID' })
    getUnitById(@Param('id', ParseIntPipe) id: number) {
        return this.service.getUnitById(id);
    }

    @Put('unit/:id')
    @ApiOperation({ summary: 'Update unit details' })
    updateUnit(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
        return this.service.updateUnit(id, dto);
    }

    @Patch('unit/:id/status')
    @ApiOperation({ summary: 'Change unit status' })
    changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitStatusDto) {
        return this.service.changeStatus(id, dto);
    }

    @Delete('unit/:id')
    @ApiOperation({ summary: 'Delete unit' })
    deleteUnit(@Param('id', ParseIntPipe) id: number) {
        return this.service.deleteUnit(id);
    }
}
