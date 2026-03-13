import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query, 
  Put, 
  Res, 
  DefaultValuePipe, 
  ParseIntPipe,
  HttpCode, 
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AccountMasterService } from './account-master.service';
import { CreateAccountMasterDto, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Account Master')
@Controller('account-master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountMasterController {
  constructor(private readonly accountMasterService: AccountMasterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createAccountMasterDto: CreateAccountMasterDto) {
    return this.accountMasterService.create(createAccountMasterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts with optional filtering and pagination' })
  @ApiQuery({ name: 'groupName', required: false, type: String })
  @ApiQuery({ name: 'gstNo', required: false, type: String })
  @ApiQuery({ name: 'panNo', required: false, type: String })
  @ApiQuery({ name: 'creditDays', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAll(
    @Query('groupName') groupName?: string,
    @Query('gstNo') gstNo?: string,
    @Query('panNo') panNo?: string,
    @Query('creditDays') creditDays?: number,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accountMasterService.findAll({ 
      groupName, 
      gstNo, 
      panNo, 
      creditDays: creditDays ? Number(creditDays) : undefined, 
      isActive: isActive !== undefined ? isActive === 'true' : undefined, 
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export accounts list to XLSX or PDF format' })
  @ApiQuery({ name: 'format', required: true, enum: ['xlsx', 'pdf'], description: 'Export format' })
  @ApiQuery({ name: 'groupName', required: false, type: String })
  @ApiQuery({ name: 'gstNo', required: false, type: String })
  @ApiQuery({ name: 'panNo', required: false, type: String })
  @ApiQuery({ name: 'creditDays', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async exportAccounts(
    @Res() res: Response,
    @Query('format') format: string,
    @Query('groupName') groupName?: string,
    @Query('gstNo') gstNo?: string,
    @Query('panNo') panNo?: string,
    @Query('creditDays') creditDays?: number,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      groupName, 
      gstNo, 
      panNo, 
      creditDays: creditDays ? Number(creditDays) : undefined, 
      isActive: isActive !== undefined ? isActive === 'true' : undefined, 
      search 
    };

    const file = await this.accountMasterService.exportAccounts(format.toLowerCase(), filters);

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.buffer.length,
    });

    res.send(file.buffer);
  }

  @Get('pincode/:pincode')
  @ApiOperation({ summary: 'Lookup city, state, and country from a pincode' })
  @ApiParam({ name: 'pincode', required: true, description: '6-digit Indian Pincode' })
  getPincodeDetails(@Param('pincode') pincode: string) {
    return this.accountMasterService.getPincodeDetails(pincode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a specific account' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the account' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountMasterService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update existing account details' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the account' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAccountMasterDto: UpdateAccountMasterDto) {
    return this.accountMasterService.update(id, updateAccountMasterDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle status of an account (Active/Inactive)' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the account' })
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateAccountStatusDto
  ) {
    return this.accountMasterService.updateStatus(id, updateStatusDto);
  }
}
