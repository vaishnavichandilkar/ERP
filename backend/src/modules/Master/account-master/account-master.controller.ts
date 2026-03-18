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
  UseGuards,
  UploadedFiles, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AccountMasterService } from './account-master.service';
import { CreateAccountMasterDto, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MasterStatus } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/multer.config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@ApiTags('Account Master')
@Controller('account-master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountMasterController {
  constructor(private readonly accountMasterService: AccountMasterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account with multipart/form-data support' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'msmeCertificate', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
  ], multerConfig))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { msmeCertificate?: Express.Multer.File[], otherDocuments?: Express.Multer.File[] }
  ) {
    body = body || {};
    // Parse nested objects that come as strings in form-data
    if (typeof body.groupName === 'string') {
      try { body.groupName = JSON.parse(body.groupName); } catch (e) {
          // Fallback if not JSON stringified properly but sent as multiple keys
          if (Array.isArray(body.groupName)) body.groupName = body.groupName;
          else body.groupName = [body.groupName];
      }
    }
    
    if (typeof body.contactPerson === 'string') {
      try { body.contactPerson = JSON.parse(body.contactPerson); } catch (e) {}
    }
    
    if (typeof body.supplier === 'string') {
      try { body.supplier = JSON.parse(body.supplier); } catch (e) {}
    }
    
    if (typeof body.customer === 'string') {
      try { body.customer = JSON.parse(body.customer); } catch (e) {}
    }
    
    if (typeof body.msmeDetails === 'string') {
      try { body.msmeDetails = JSON.parse(body.msmeDetails); } catch (e) {}
    }

    if (body.msmeEnabled === 'true') body.msmeEnabled = true;
    if (body.msmeEnabled === 'false') body.msmeEnabled = false;

    // Attach file URLs to payload
    if (files?.msmeCertificate?.[0]) {
      body.msmeDetails = body.msmeDetails || {};
      // Handle the absolute path multer config dynamically returns based on standard upload practices in this repo
      body.msmeDetails.certificateUrl = `/uploads/${files.msmeCertificate[0].filename}`; 
    }

    if (files?.otherDocuments && files.otherDocuments.length > 0) {
      body.otherDocuments = files.otherDocuments.map(file => `/uploads/${file.filename}`);
    } else if (typeof body.otherDocuments === 'string') {
       // if strings were passed as standard links
       try { body.otherDocuments = JSON.parse(body.otherDocuments); } catch (e) {}
    }

    const dto = plainToInstance(CreateAccountMasterDto, body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      const messages = errors.map(err => Object.values(err.constraints || {})).flat();
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages
      });
    }

    return this.accountMasterService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts with optional filtering and pagination' })
  @ApiQuery({ name: 'groupName', required: false, type: String })
  @ApiQuery({ name: 'gstNo', required: false, type: String })
  @ApiQuery({ name: 'panNo', required: false, type: String })
  @ApiQuery({ name: 'creditDays', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: MasterStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAll(
    @Query('groupName') groupName?: string,
    @Query('gstNo') gstNo?: string,
    @Query('panNo') panNo?: string,
    @Query('creditDays') creditDays?: number,
    @Query('status') status?: MasterStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accountMasterService.findAll({ 
      groupName, 
      gstNo, 
      panNo, 
      creditDays: creditDays ? Number(creditDays) : undefined, 
      status, 
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
  @ApiQuery({ name: 'status', required: false, enum: MasterStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async exportAccounts(
    @Res() res: Response,
    @Query('format') format: string,
    @Query('groupName') groupName?: string,
    @Query('gstNo') gstNo?: string,
    @Query('panNo') panNo?: string,
    @Query('creditDays') creditDays?: number,
    @Query('status') status?: MasterStatus,
    @Query('search') search?: string,
  ) {
    const filters = {
      groupName, 
      gstNo, 
      panNo, 
      creditDays: creditDays ? Number(creditDays) : undefined, 
      status, 
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

  @Get('generate-customer-code')
  @ApiOperation({ summary: 'Generate next available customer code' })
  async generateCustomerCode() {
    const customerCode = await this.accountMasterService.generateCustomerCode();
    return { customerCode };
  }

  @Get('generate-supplier-code')
  @ApiOperation({ summary: 'Generate next available supplier code' })
  async generateSupplierCode() {
    const supplierCode = await this.accountMasterService.generateSupplierCode();
    return { supplierCode };
  }

  @Get('generate-code')
  @ApiOperation({ summary: 'Generate next available code for a given group Name (Legacy)' })
  @ApiQuery({ name: 'group', required: true, type: String })
  async generateCode(@Query('group') group: string) {
    const code = await this.accountMasterService.generateCode(group);
    return { code };
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
