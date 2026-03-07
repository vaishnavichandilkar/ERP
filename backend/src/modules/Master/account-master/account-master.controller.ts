import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  Put, 
  Res, 
  DefaultValuePipe, 
  ParseBoolPipe, 
  HttpCode, 
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AccountMasterService } from './account-master.service';
import { CreateAccountMasterDto, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Response } from 'express';

@ApiTags('Account Master')
@Controller('account-master')
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
  @ApiOperation({ summary: 'Get all accounts with optional filtering' })
  @ApiQuery({ name: 'accountGroup', required: false, type: String })
  @ApiQuery({ name: 'vendorCode', required: false, type: String })
  findAll(
    @Query('accountGroup') accountGroup?: string,
    @Query('vendorCode') vendorCode?: string,
  ) {
    return this.accountMasterService.findAll({ accountGroup, vendorCode });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export accounts list to CSV format (acting as XLSX alternative without external deps)' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'pdf'], description: 'Export format' })
  async exportAccounts(
    @Res() res: Response,
    @Query('format', new DefaultValuePipe('csv')) format: string,
  ) {
    const file = await this.accountMasterService.exportAccounts(format.toLowerCase());

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
  @ApiParam({ name: 'id', required: true, description: 'UUID of the account' })
  findOne(@Param('id') id: string) {
    return this.accountMasterService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update existing account details' })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the account' })
  update(@Param('id') id: string, @Body() updateAccountMasterDto: UpdateAccountMasterDto) {
    return this.accountMasterService.update(id, updateAccountMasterDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle status of an account (Active/Inactive)' })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the account' })
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAccountStatusDto
  ) {
    return this.accountMasterService.updateStatus(id, updateStatusDto);
  }
}
