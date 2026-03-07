import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAccountMasterDto, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountMasterService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAccountMasterDto) {
    const existingVendor = await this.prisma.accountMaster.findUnique({
      where: { vendorCode: createDto.vendorCode },
    });

    if (existingVendor) {
      throw new BadRequestException('Vendor code already exists');
    }

    return this.prisma.accountMaster.create({
      data: createDto,
    });
  }

  async findAll(filter: { accountGroup?: string; vendorCode?: string }) {
    const where: Prisma.AccountMasterWhereInput = {};
    
    if (filter.accountGroup) {
      where.group = { contains: filter.accountGroup, mode: 'insensitive' };
    }
    
    if (filter.vendorCode) {
      where.vendorCode = { contains: filter.vendorCode, mode: 'insensitive' };
    }

    return this.prisma.accountMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.accountMaster.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(id: string, updateDto: UpdateAccountMasterDto) {
    await this.findOne(id);

    if (updateDto.vendorCode) {
      const existingVendor = await this.prisma.accountMaster.findFirst({
        where: { 
          vendorCode: updateDto.vendorCode,
          id: { not: id }
        },
      });

      if (existingVendor) {
        throw new BadRequestException('Vendor code already exists for another account');
      }
    }

    return this.prisma.accountMaster.update({
      where: { id },
      data: updateDto,
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateAccountStatusDto) {
    await this.findOne(id);
    return this.prisma.accountMaster.update({
      where: { id },
      data: { isActive: updateStatusDto.isActive },
    });
  }

  async getPincodeDetails(pincode: string) {
    // Check local database first if we store known pincodes
    const localPincode = await this.prisma.pincode.findUnique({
      where: { pincode },
    });

    if (localPincode) {
      return {
        city: localPincode.district,
        state: localPincode.state,
        country: 'India',
        district: localPincode.district,
      };
    }

    // Fallback: Fetch from India Post API (public endpoint)
    // Normally we would use HttpService from @nestjs/axios, but fetch is native in Node 18+
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        
        // Optionally save to DB to avoid future lookups
        await this.prisma.pincode.create({
          data: {
            pincode: pincode,
            state: postOffice.State,
            district: postOffice.District,
          }
        }).catch(() => { /* Ignore unique constraint violations if concurrently created */ });
        
        return {
          city: postOffice.District, // Often City and District map closely in this API
          state: postOffice.State,
          country: postOffice.Country,
          district: postOffice.District,
        };
      } else {
        throw new NotFoundException('Pincode details not found in external API');
      }
    } catch (error) {
       if (error instanceof NotFoundException) throw error;
       throw new BadRequestException('Failed to fetch pincode details automatically. Please enter manually.');
    }
  }

  async exportAccounts(format: string) {
    const accounts = await this.prisma.accountMaster.findMany({
      orderBy: { accountName: 'asc' },
    });

    if (accounts.length === 0) {
      throw new BadRequestException('No data available to export');
    }

    if (format === 'csv') {
      const header = [
        'Account Name', 'Group', 'Vendor Code', 'PAN', 'GST', 'MSME', 
        'Mobile No', 'Email', 'City', 'State', 'Status'
      ].join(',');

      const rows = accounts.map(acc => [
        `"${acc.accountName}"`,
        `"${acc.group}"`,
        `"${acc.vendorCode}"`,
        `"${acc.pan}"`,
        `"${acc.gstNo || ''}"`,
        `"${acc.msme || ''}"`,
        `"${acc.mobileNo || ''}"`,
        `"${acc.emailId || ''}"`,
        `"${acc.city}"`,
        `"${acc.state}"`,
        `"${acc.isActive ? 'Active' : 'Inactive'}"`
      ].join(','));

      const csvContent = [header, ...rows].join('\n');
      return {
        buffer: Buffer.from(csvContent, 'utf-8'),
        filename: `accounts_export_${Date.now()}.csv`,
        mimetype: 'text/csv'
      };
    } 

    // For PDF/XLSX properly, appropriate libraries (like pdfkit, exceljs, xlsx) would be imported and used.
    // Given the lack of these libraries in package.json currently, CSV is the universally accepted spreadsheet standard natively exportable.
    // Returning dummy PDF format handler that could be expanded:
    if (format === 'pdf') {
      throw new BadRequestException('PDF generation library not installed. Please try CSV export.');
    }
    
    throw new BadRequestException('Unsupported format. Please use csv.');
  }
}
