import { Controller, Get, Post, Body, Put, Patch, Param, Query, ParseIntPipe, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnitMasterService } from './unit-master.service';
import { CreateUnitDto, UpdateUnitDto, UnitQueryDto, UpdateUnitStatusDto } from './dto/unit-master.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Unit Master')
@Controller('master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnitMasterController {
    constructor(private readonly service: UnitMasterService) { }

    @Get('unit-library')
    @ApiOperation({ summary: 'Get all units from system library' })
    getUnitLibrary(@Query('search') search?: string, @Query('gst_uom') gst_uom?: string, @Query('unit_name') unit_name?: string) {
        return this.service.getUnitLibrary({ search, gst_uom, unit_name });
    }

    @Get('unit-names')
    @ApiOperation({ summary: 'Get distinct unit names from system library' })
    getUnitNames() {
        return this.service.getDistinctUnitNames();
    }

    @Get('gst-uoms')
    @ApiOperation({ summary: 'Get distinct GST UOM codes from system library' })
    getGstUoms() {
        return this.service.getDistinctGstUoms();
    }

    @Get('uom/:unit_name')
    @ApiOperation({ summary: 'Get UOM codes by unit name from system library' })
    getUomByUnitName(@Param('unit_name') unitName: string) {
        return this.service.getUomByUnitName(unitName);
    }

    @Get('measurement/:uom_code')
    @ApiOperation({ summary: 'Get measurement name by UOM code from system library' })
    getMeasurementByUom(@Param('uom_code') uomCode: string) {
        return this.service.getMeasurementByUom(uomCode);
    }

    @Post('add-unit')
    @ApiOperation({ summary: 'Add a unit (Smart Link to Library)' })
    addUnit(@Request() req, @Body() dto: CreateUnitDto) {
        return this.service.addUnit(req.user.userId, dto);
    }

    @Post('unit')
    @ApiOperation({ summary: 'Create a new unit' })
    createUnit(@Request() req, @Body() dto: CreateUnitDto) {
        return this.service.createUnit(req.user.userId, dto);
    }

    @Get('units')
    @ApiOperation({ summary: 'Get list of user units with filters' })
    getUnitsList(@Request() req, @Query() query: UnitQueryDto) {
        return this.service.getUnitsList(req.user.userId, query);
    }

    @Get('unit/:id')
    @ApiOperation({ summary: 'Get unit details by ID' })
    getUnitById(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.service.getUnitById(req.user.userId, id);
    }

    @Put('unit/:id')
    @ApiOperation({ summary: 'Update unit details' })
    updateUnit(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
        return this.service.updateUnit(req.user.userId, id, dto);
    }

    @Patch('unit/:id/status')
    @ApiOperation({ summary: 'Change unit status' })
    changeStatus(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitStatusDto) {
        return this.service.toggleStatus(req.user.userId, id, dto);
    }

    @Post('unit/import')
    @ApiOperation({ summary: 'Import units from XLSX' })
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
    async importUnits(
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        if (!file) {
            throw new BadRequestException('Excel file is required');
        }
        return this.service.importUnits(file.buffer, req.user.userId);
    }
}
