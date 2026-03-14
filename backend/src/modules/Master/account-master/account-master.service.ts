import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAccountMasterDto, GroupNameEnum, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Prisma, MasterStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class AccountMasterService {
  constructor(private prisma: PrismaService) {}

  async generateCode(groupName: string): Promise<string> {
    const isVendor = groupName === GroupNameEnum.CREDITORS;
    const prefix = isVendor ? 'VN' : 'CT';

    const lastAccount = await this.prisma.accountMaster.findFirst({
      where: { groupName },
      orderBy: { id: 'desc' },
    });

    let seq = 1;
    if (lastAccount && lastAccount.code && lastAccount.code.startsWith(prefix)) {
      const lastSeq = parseInt(lastAccount.code.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }

  async create(createDto: CreateAccountMasterDto) {
    const code = await this.generateCode(createDto.groupName);

    let { city, state } = createDto;

    if (!city || !state) {
      const pinDetails = await this.getPincodeDetails(createDto.pincode);
      city = city || pinDetails.city;
      state = state || pinDetails.state;
    }

    return this.prisma.accountMaster.create({
      data: {
        ...createDto,
        city: city as string,
        state: state as string,
        code,
      },
    });
  }

  async findAll(filter: { 
    groupName?: string; 
    gstNo?: string; 
    panNo?: string; 
    creditDays?: number; 
    status?: MasterStatus; 
    search?: string; 
    page?: number;
    limit?: number;
    isExport?: boolean;
  }) {
    const where: Prisma.AccountMasterWhereInput = {};
    
    if (filter.groupName) {
      where.groupName = filter.groupName;
    }
    
    if (filter.gstNo) {
      where.gstNo = { contains: filter.gstNo, mode: 'insensitive' };
    }

    if (filter.panNo) {
      where.panNo = { contains: filter.panNo, mode: 'insensitive' };
    }

    if (filter.creditDays !== undefined) {
      where.creditDays = filter.creditDays;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.search) {
      const parsedNum = parseInt(filter.search, 10);
      
      where.OR = [
        // Identity
        { accountName: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { groupName: { contains: filter.search, mode: 'insensitive' } },
        
        // Tax
        { gstNo: { contains: filter.search, mode: 'insensitive' } },
        { panNo: { contains: filter.search, mode: 'insensitive' } },

        // Finance
        { accountNumber: { contains: filter.search, mode: 'insensitive' } },
        { ifscCode: { contains: filter.search, mode: 'insensitive' } },
        { bankName: { contains: filter.search, mode: 'insensitive' } },
        { accountHolderName: { contains: filter.search, mode: 'insensitive' } },

        // Contact
        { contactPersonName: { contains: filter.search, mode: 'insensitive' } },
        { mobileNo: { contains: filter.search, mode: 'insensitive' } },
        { emailId: { contains: filter.search, mode: 'insensitive' } },

        // Location
        { addressLine1: { contains: filter.search, mode: 'insensitive' } },
        { pincode: { contains: filter.search, mode: 'insensitive' } },
        { area: { contains: filter.search, mode: 'insensitive' } },
        { city: { contains: filter.search, mode: 'insensitive' } },
      ];

      if (!isNaN(parsedNum)) {
        where.OR.push({ creditDays: parsedNum });
      }
    }

    if (filter.isExport) {
       const data = await this.prisma.accountMaster.findMany({
         where,
         orderBy: { createdAt: 'desc' },
       });
       return {
           data,
           total: data.length,
           page: 1,
           limit: data.length,
           totalPages: 1
       };
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.accountMaster.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.accountMaster.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const account = await this.prisma.accountMaster.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(id: number, updateDto: UpdateAccountMasterDto) {
    await this.findOne(id);

    if (updateDto.code) {
      const existingCode = await this.prisma.accountMaster.findFirst({
        where: { 
          code: updateDto.code,
          id: { not: id }
        },
      });

      if (existingCode) {
        throw new BadRequestException('Code already exists for another account');
      }
    }

    // code should practically not be updated manually according to rules, but DTO allows it for flexible overrides
    return this.prisma.accountMaster.update({
      where: { id },
      data: updateDto,
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateAccountStatusDto) {
    await this.findOne(id);
    return this.prisma.accountMaster.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async getPincodeDetails(pincode: string) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        const areas = postOffices.map((po: any) => po.Name);
        const postOffice = postOffices[0];
        
        await this.prisma.pincode.upsert({
          where: { pincode },
          update: {
            state: postOffice.State,
            district: postOffice.District,
          },
          create: {
            pincode: pincode,
            state: postOffice.State,
            district: postOffice.District,
          }
        }).catch(() => { /* Ignore on conflict */ });
        
        return {
          areas: areas,
          city: postOffice.District, 
          state: postOffice.State,
        };
      } else {
        // Fallback to local DB if available
        const localPincode = await this.prisma.pincode.findUnique({
          where: { pincode },
        });

        if (localPincode) {
          return {
            areas: [], // Cannot provide dropdown options from local generic cache without area DB
            city: localPincode.district,
            state: localPincode.state,
          };
        }

        throw new NotFoundException('Pincode details not found in external API');
      }
    } catch (error) {
       if (error instanceof NotFoundException) throw error;
       throw new BadRequestException('Failed to fetch pincode details automatically. Please enter manually.');
    }
  }

  async exportAccounts(format: string, filter: any) {
    const result = await this.findAll({ ...filter, isExport: true });
    const accounts = result.data;

    if (accounts.length === 0) {
      throw new BadRequestException('No data available to export');
    }

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Accounts');

      // Mandatory Column Sequence
      worksheet.columns = [
        { header: 'Code', key: 'code', width: 15 },
        { header: 'Account Name', key: 'accountName', width: 30 },
        { header: 'Group Name', key: 'groupName', width: 25 },
        { header: 'Credit Days', key: 'creditDays', width: 12 },
        { header: 'GST No', key: 'gstNo', width: 20 },
        { header: 'PAN No', key: 'panNo', width: 15 },
        { header: 'Opening Balance', key: 'openingBalance', width: 20 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Bank Account No', key: 'accountNumber', width: 20 },
        { header: 'IFSC Code', key: 'ifscCode', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      accounts.forEach(acc => {
        const fullAddress = `${acc.addressLine1}${acc.area ? ', ' + acc.area : ''}, ${acc.city}`;
        const balance = `${Number(acc.openingBalance).toLocaleString('en-IN')} ${acc.balanceType}`;
        
        worksheet.addRow({
          code: acc.code,
          accountName: acc.accountName,
          groupName: acc.groupName,
          creditDays: acc.creditDays,
          gstNo: acc.gstNo || '-',
          panNo: acc.panNo,
          openingBalance: balance,
          address: fullAddress,
          accountNumber: acc.accountNumber,
          ifscCode: acc.ifscCode,
          status: acc.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive',
        });
      });

      // Professional Styling
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Professional Blue
      };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Add Autofilter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 11 },
      };

      // Set number format for credit days if needed, but it's already fine
      
      const buffer = await workbook.xlsx.writeBuffer();
      return {
        buffer: Buffer.from(buffer),
        filename: `accounts_export_${Date.now()}.xlsx`,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } 
    
    if (format === 'pdf') {
      return new Promise<any>((resolve, reject) => {
        // Landscape A4 for 11 columns
        const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve({
            buffer: pdfData,
            filename: `accounts_export_${Date.now()}.pdf`,
            mimetype: 'application/pdf',
          });
        });

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text('Weighting Scale System', { align: 'center' });
        doc.fontSize(14).font('Helvetica').text('Account Master Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Exported on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        // Table Constants
        const tableTop = 100;
        const colX = [20, 60, 155, 245, 285, 355, 415, 485, 610, 695, 765];
        const headers = [
          'Code', 'Account Name', 'Group', 'Days', 'GST No', 
          'PAN', 'Op. Bal', 'Address', 'Bank A/C', 'IFSC', 'Status'
        ];

        // Draw Header row
        doc.rect(15, tableTop - 5, 805, 20).fill('#4472C4');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
        
        headers.forEach((header, i) => {
          doc.text(header, colX[i], tableTop);
        });

        let y = tableTop + 20;
        doc.fillColor('#000000').font('Helvetica');

        // Table Rows
        accounts.forEach((acc, index) => {
          // Page Break logic
          if (y > 550) {
            doc.addPage({ margin: 20, size: 'A4', layout: 'landscape' });
            y = 40;
            // Redraw Header on new page
            doc.rect(15, y - 5, 805, 20).fill('#4472C4');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
            headers.forEach((header, i) => {
              doc.text(header, colX[i], y);
            });
            y += 20;
            doc.fillColor('#000000').font('Helvetica');
          }

          // Shaded background for even rows
          if (index % 2 === 1) {
            doc.rect(15, y - 3, 805, 15).fill('#F2F2F2').fillColor('#000000');
          }

          const fullAddress = `${acc.addressLine1}${acc.area ? ', ' + acc.area : ''}, ${acc.city}`;
          const balance = `${Number(acc.openingBalance).toLocaleString('en-IN')} ${acc.balanceType}`;

          doc.fontSize(7);
          doc.text(acc.code, colX[0], y, { width: 38, lineBreak: true });
          doc.text(acc.accountName.substring(0, 30), colX[1], y, { width: 90, lineBreak: true });
          doc.text(acc.groupName.split(' ')[0], colX[2], y, { width: 85, lineBreak: true });
          doc.text(acc.creditDays.toString(), colX[3], y, { width: 35, lineBreak: false });
          doc.text(acc.gstNo || '-', colX[4], y, { width: 65, lineBreak: true });
          doc.text(acc.panNo, colX[5], y, { width: 55, lineBreak: true });
          doc.text(balance, colX[6], y, { width: 65, lineBreak: true });
          doc.text(fullAddress.substring(0, 45), colX[7], y, { width: 120, lineBreak: true });
          doc.text(acc.accountNumber, colX[8], y, { width: 80, lineBreak: true });
          doc.text(acc.ifscCode, colX[9], y, { width: 65, lineBreak: true });
          doc.text(acc.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive', colX[10], y, { width: 50, lineBreak: false });
          
          y += 18;
        });

        doc.end();
      });
    }

    throw new BadRequestException('Format is required. Please use xlsx or pdf.');
  }
}
