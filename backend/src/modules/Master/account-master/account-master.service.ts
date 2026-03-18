import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAccountMasterDto, GroupNameEnum, UpdateAccountMasterDto, UpdateAccountStatusDto } from './dto/account-master.dto';
import { Prisma, MasterStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccountMasterService {
  constructor(private prisma: PrismaService) {}

  async generateCustomerCode(): Promise<string> {
    const prefix = 'CT';
    const lastAccount = await this.prisma.accountMaster.findFirst({
      where: { customerCode: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let seq = 1;
    if (lastAccount && lastAccount.customerCode) {
      const lastSeq = parseInt(lastAccount.customerCode.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async generateSupplierCode(): Promise<string> {
    const prefix = 'SP';
    const lastAccount = await this.prisma.accountMaster.findFirst({
      where: { supplierCode: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let seq = 1;
    if (lastAccount && lastAccount.supplierCode) {
      const lastSeq = parseInt(lastAccount.supplierCode.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async generateCode(groupName: string): Promise<string> {
    if (groupName === GroupNameEnum.SUNDRY_CREDITORS || groupName === 'SUPPLIER') {
      return this.generateSupplierCode();
    }
    return this.generateCustomerCode();
  }

  private async handleFileUploads(accountId: number, files?: { msmeCertificate?: Express.Multer.File[], otherDocuments?: Express.Multer.File[] }) {
    if (!files) return;
    
    const uploadPath = './uploads/accountmaster';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const updates: any = {};
    if (files?.msmeCertificate?.[0]) {
      const file = files.msmeCertificate[0];
      const newName = `${accountId}_${file.originalname.replace(/\s+/g, '_')}`;
      const newPath = path.join(uploadPath, newName);
      if (fs.existsSync(file.path)) {
        fs.renameSync(file.path, newPath);
        updates.msmeCertificateUrl = `/uploads/accountmaster/${newName}`;
      }
    }

    if (files?.otherDocuments && files.otherDocuments.length > 0) {
      const docUrls = files.otherDocuments.map((file, index) => {
         const newName = `${accountId}_${file.originalname.replace(/\s+/g, '_')}`;
         const newPath = path.join(uploadPath, newName);
         if (fs.existsSync(file.path)) {
           fs.renameSync(file.path, newPath);
           return `/uploads/accountmaster/${newName}`;
         }
         return null;
      }).filter(url => url !== null);
      
      if (docUrls.length > 0) {
        updates.otherDocuments = docUrls;
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.accountMaster.update({
        where: { id: accountId },
        data: updates
      });
    }
  }

  async create(createDto: CreateAccountMasterDto, files?: any) {
    let { subDistrict, district, country, state } = createDto;

    let supplierCode = null;
    let customerCode = null;

    if (createDto.groupName.includes(GroupNameEnum.SUNDRY_CREDITORS)) {
      supplierCode = createDto.supplierCode || await this.generateSupplierCode();
    }
    
    if (createDto.groupName.includes(GroupNameEnum.SUNDRY_DEBTORS)) {
      customerCode = createDto.customerCode || await this.generateCustomerCode();
    }

    if ((!district || !state) && createDto.pincode) {
      const pinDetails = await this.getPincodeDetails(createDto.pincode);
      district = district || pinDetails.district;
      subDistrict = subDistrict || pinDetails.subDistrict;
      state = state || pinDetails.state;
      country = country || pinDetails.country;
    }

    const account = await this.prisma.accountMaster.create({
      data: {
        accountName: createDto.accountName,
        groupName: createDto.groupName,
        gstNo: createDto.gstNo,
        panNo: createDto.panNo,
        
        addressLine1: createDto.addressLine1,
        addressLine2: createDto.addressLine2,
        pincode: createDto.pincode,
        area: createDto.area,
        subDistrict,
        district,
        state,
        country,

        prefix: createDto.prefix,
        contactPersonName: createDto.contactPersonName,
        emailId: createDto.emailId,
        mobileNo: createDto.mobileNo,

        supplierCode,
        supplierCreditDays: createDto.supplierCreditDays,
        supplierOpeningBalance: createDto.supplierOpeningBalance,
        supplierBalanceType: createDto.supplierBalanceType,

        customerCode,
        customerCreditDays: createDto.customerCreditDays,
        customerOpeningBalance: createDto.customerOpeningBalance,
        customerBalanceType: createDto.customerBalanceType,

        msmeEnabled: createDto.msmeEnabled || false,
        msmeId: createDto.msmeEnabled ? createDto.msmeId : null,
        regUnder: createDto.msmeEnabled ? createDto.regUnder : null,
        regType: createDto.msmeEnabled ? createDto.regType : null,
        msmeCertificateUrl: createDto.msmeEnabled ? createDto.msmeCertificateUrl : null,

        otherDocuments: createDto.otherDocuments ? createDto.otherDocuments : Prisma.DbNull,
        status: createDto.status || MasterStatus.ACTIVE
      },
    });

    await this.handleFileUploads(account.id, files);
    
    return {
      success: true,
      message: "Account created successfully",
      data: {
        accountId: account.id,
        supplierCode: account.supplierCode,
        customerCode: account.customerCode
      }
    };
  }

  async findAll(filter: { 
    groupName?: string; 
    gstNo?: string; 
    panNo?: string; 
    creditDays?: number | string; 
    status?: MasterStatus | string; 
    search?: string; 
    page?: number;
    limit?: number;
    isExport?: boolean;
  }) {
    const where: Prisma.AccountMasterWhereInput = {};
    
    if (filter.groupName) {
      const upperGroup = filter.groupName.toUpperCase();
      where.groupName = { has: upperGroup };
    }
    
    if (filter.gstNo) {
      where.gstNo = { contains: filter.gstNo, mode: 'insensitive' };
    }

    if (filter.panNo) {
      where.panNo = { contains: filter.panNo, mode: 'insensitive' };
    }

    if (filter.creditDays !== undefined && filter.creditDays !== '') {
      const days = Number(filter.creditDays);
      if (!isNaN(days)) {
        where.OR = [
          { supplierCreditDays: days },
          { customerCreditDays: days }
        ];
      }
    }

    if (filter.status) {
      const statusStr = String(filter.status).toUpperCase();
      if (statusStr === 'ACTIVE' || statusStr === 'INACTIVE') {
         where.status = statusStr as MasterStatus;
      }
    }

    if (filter.search) {
      const parsedNum = parseInt(filter.search, 10);
      const upperSearch = filter.search.toUpperCase();
      
      const searchConditions: Prisma.AccountMasterWhereInput['OR'] = [
        // Identity
        { accountName: { contains: filter.search, mode: 'insensitive' } },
        { customerCode: { contains: filter.search, mode: 'insensitive' } },
        { supplierCode: { contains: filter.search, mode: 'insensitive' } },
        
        // Group / Array matches (exact uppercase check for Enum matches)
        { groupName: { hasSome: [upperSearch, upperSearch.includes('CRE') ? 'SUNDRY_CREDITORS' : '', upperSearch.includes('DEB') ? 'SUNDRY_DEBTORS' : ''].filter(Boolean) } },

        // Tax
        { gstNo: { contains: filter.search, mode: 'insensitive' } },
        { panNo: { contains: filter.search, mode: 'insensitive' } },

        // Contact
        { contactPersonName: { contains: filter.search, mode: 'insensitive' } },
        { mobileNo: { contains: filter.search, mode: 'insensitive' } },
        { emailId: { contains: filter.search, mode: 'insensitive' } },

        // Location
        { addressLine1: { contains: filter.search, mode: 'insensitive' } },
        { pincode: { contains: filter.search, mode: 'insensitive' } },
        { area: { contains: filter.search, mode: 'insensitive' } },
        { district: { contains: filter.search, mode: 'insensitive' } },
      ];

      if (!isNaN(parsedNum)) {
        searchConditions.push({ supplierCreditDays: parsedNum });
        searchConditions.push({ customerCreditDays: parsedNum });
        searchConditions.push({ supplierOpeningBalance: parsedNum });
        searchConditions.push({ customerOpeningBalance: parsedNum });
      }

      if ('ACTIVE'.startsWith(upperSearch)) searchConditions.push({ status: MasterStatus.ACTIVE });
      if ('INACTIVE'.startsWith(upperSearch)) searchConditions.push({ status: MasterStatus.INACTIVE });

      if (where.OR) {
         where.AND = [
           { OR: where.OR },
           { OR: searchConditions }
         ];
         delete where.OR;
      } else {
         where.OR = searchConditions;
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

  async update(id: number, updateDto: UpdateAccountMasterDto, files?: any) {
    await this.findOne(id);
    
    // Convert nested properties back for update if needed. We'll simplify Update strategy.
    const data: Prisma.AccountMasterUpdateInput = {
      accountName: updateDto.accountName,
      groupName: updateDto.groupName,
      gstNo: updateDto.gstNo,
      panNo: updateDto.panNo,
      addressLine1: updateDto.addressLine1,
      addressLine2: updateDto.addressLine2,
      pincode: updateDto.pincode,
      area: updateDto.area,
      subDistrict: updateDto.subDistrict,
      district: updateDto.district,
      state: updateDto.state,
      country: updateDto.country,
      prefix: updateDto.prefix,
      contactPersonName: updateDto.contactPersonName,
      emailId: updateDto.emailId,
      mobileNo: updateDto.mobileNo,
      supplierCode: updateDto.supplierCode,
      supplierCreditDays: updateDto.supplierCreditDays,
      supplierOpeningBalance: updateDto.supplierOpeningBalance,
      supplierBalanceType: updateDto.supplierBalanceType,
      customerCode: updateDto.customerCode,
      customerCreditDays: updateDto.customerCreditDays,
      customerOpeningBalance: updateDto.customerOpeningBalance,
      customerBalanceType: updateDto.customerBalanceType,
      msmeEnabled: updateDto.msmeEnabled,
    };
    
    if (updateDto.msmeEnabled === true) {
       data.msmeId = updateDto.msmeId;
       data.regUnder = updateDto.regUnder;
       data.regType = updateDto.regType;
       if (updateDto.msmeCertificateUrl) data.msmeCertificateUrl = updateDto.msmeCertificateUrl;
    } else if (updateDto.msmeEnabled === false) {
       data.msmeId = null;
       data.regUnder = null;
       data.regType = null;
       data.msmeCertificateUrl = null;
    }

    if (updateDto.otherDocuments) {
       data.otherDocuments = updateDto.otherDocuments;
    }

    // Clean undefined
    Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

    const updated = await this.prisma.accountMaster.update({
      where: { id },
      data,
    });
    
    await this.handleFileUploads(id, files);
    
    return {
      success: true,
      message: "Account updated successfully",
      data: updated
    };
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
        const areas = Array.from(new Set(
          postOffices
            .map((po: any) => po.Name)
            .filter((name: any) => typeof name === 'string' && name.trim() !== '')
        )).sort();
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
          district: postOffice.District || '', 
          state: postOffice.State,
          subDistrict: postOffice.Block || postOffice.District || '',
          country: postOffice.Country || 'India',
        };
      } else {
        // Fallback to local DB if available
        const localPincode = await this.prisma.pincode.findUnique({
          where: { pincode },
        });

        if (localPincode) {
          return {
            areas: [], // Cannot provide dropdown options from local generic cache without area DB
            district: localPincode.district,
            state: localPincode.state,
            subDistrict: '',
            country: 'India',
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
        { header: 'Customer Code', key: 'customerCode', width: 15 },
        { header: 'Supplier Code', key: 'supplierCode', width: 15 },
        { header: 'Account Name', key: 'accountName', width: 30 },
        { header: 'Groups', key: 'groupName', width: 20 },
        { header: 'GST No', key: 'gstNo', width: 20 },
        { header: 'PAN No', key: 'panNo', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      accounts.forEach(acc => {
        const fullAddress = `${acc.addressLine1}${acc.area ? ', ' + acc.area : ''}, ${acc.district}`;
        
        worksheet.addRow({
          customerCode: acc.customerCode || '-',
          supplierCode: acc.supplierCode || '-',
          accountName: acc.accountName,
          groupName: acc.groupName.join(', '),
          gstNo: acc.gstNo || '-',
          panNo: acc.panNo,
          address: fullAddress,
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
        to: { row: 1, column: 8 },
      };
      
      const buffer = await workbook.xlsx.writeBuffer();
      return {
        buffer: Buffer.from(buffer),
        filename: `accounts_export_${Date.now()}.xlsx`,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } 
    
    if (format === 'pdf') {
      return new Promise<any>((resolve, reject) => {
        // Landscape A4
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
        const colX = [20, 75, 130, 245, 345, 415, 470, 750];
        const headers = [
          'Cust Code', 'Supp Code', 'Account Name', 'Groups', 'GST No', 
          'PAN', 'Address', 'Status'
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

          if (index % 2 === 1) {
            doc.rect(15, y - 3, 805, 15).fill('#F2F2F2').fillColor('#000000');
          }

          const fullAddress = `${acc.addressLine1}${acc.area ? ', ' + acc.area : ''}, ${acc.district}`;

          doc.fontSize(7);
          doc.text(acc.customerCode || '-', colX[0], y, { width: 50, lineBreak: true });
          doc.text(acc.supplierCode || '-', colX[1], y, { width: 50, lineBreak: true });
          doc.text(acc.accountName.substring(0, 30), colX[2], y, { width: 110, lineBreak: true });
          doc.text(acc.groupName.join(', '), colX[3], y, { width: 95, lineBreak: false });
          doc.text(acc.gstNo || '-', colX[4], y, { width: 65, lineBreak: true });
          doc.text(acc.panNo, colX[5], y, { width: 50, lineBreak: true });
          doc.text(fullAddress.substring(0, 90), colX[6], y, { width: 275, lineBreak: true });
          doc.text(acc.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive', colX[7], y, { width: 50, lineBreak: false });
          
          y += 18;
        });

        doc.end();
      });
    }

    throw new BadRequestException('Format is required. Please use xlsx or pdf.');
  }
}
