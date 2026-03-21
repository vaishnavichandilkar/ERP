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

    return `${prefix}${seq.toString().padStart(5, '0')}`;
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

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }

  async generateCode(groupName: string): Promise<string> {
    if (groupName === GroupNameEnum.SUNDRY_CREDITORS || groupName === 'SUPPLIER') {
      return this.generateSupplierCode();
    }
    return this.generateCustomerCode();
  }

  private async handleFileUploads(account: any, files?: { msmeCertificate?: Express.Multer.File[], otherDocuments?: Express.Multer.File[] }) {
    if (!files || (!files.msmeCertificate && !files.otherDocuments)) return;
    try {
      console.log('--- handleFileUploads STARTED ---');
      console.log('Account ID:', account.id);
      console.log('Account Name:', account.accountName);
      console.log('User ID:', account.userId);
      console.log('Files provided:', Object.keys(files || {}));

      // Create specific folder: uploads/account_upload/{userId}_{accountName}
      const safeAccountName = account.accountName.replace(/[^a-zA-Z0-9]/g, '_');
      const folderName = `${account.userId}_${safeAccountName}`;
      const uploadPath = path.resolve(process.cwd(), 'uploads', 'account_upload', folderName);
      
      console.log('Target uploadPath (absolute):', uploadPath);

      if (!fs.existsSync(uploadPath)) {
        console.log('Creating directory:', uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      } else {
        console.log('Directory already exists:', uploadPath);
      }

      const updates: any = {};
      const baseUrl = `account_upload/${folderName}`;
      const generateRandomNumber = () => Math.floor(100000 + Math.random() * 900000);

      if (files?.msmeCertificate?.[0]) {
        const file = files.msmeCertificate[0];
        console.log('Processing MSME Certificate:', file.originalname);
        console.log('Multer file path:', file.path);
        const sourcePath = path.resolve(process.cwd(), file.path);
        console.log('Source path (absolute):', sourcePath);

        const extension = path.extname(file.originalname);
        const randomName = `${generateRandomNumber()}_MSME${extension}`;
        const newPath = path.join(uploadPath, randomName);
        
        if (fs.existsSync(sourcePath)) {
          console.log('Renaming file to:', randomName);
          fs.renameSync(sourcePath, newPath);
          updates.msmeCertificateUrl = `${baseUrl}/${randomName}`;
        } else {
          console.log('Source file NOT found at:', sourcePath);
        }
      }

      if (files?.otherDocuments && files.otherDocuments.length > 0) {
        console.log('Processing otherDocuments:', files.otherDocuments.length);
        const docUrls = files.otherDocuments.map((file) => {
           console.log('Processing doc:', file.originalname, 'at', file.path);
           const sourcePath = path.resolve(process.cwd(), file.path);
           const extension = path.extname(file.originalname);
           const randomNumber = Math.floor(100000 + Math.random() * 900000);
           const randomName = `${randomNumber}_DOC${extension}`;
           const newPath = path.join(uploadPath, randomName);
           
           if (fs.existsSync(sourcePath)) {
             console.log('Moving doc to:', newPath);
             fs.renameSync(sourcePath, newPath);
             return `${baseUrl}/${randomName}`;
           }
           console.log('Source doc NOT found at:', sourcePath);
           return null;
        }).filter(url => url !== null);
        
        console.log('Generated docUrls:', docUrls);
        if (docUrls.length > 0) {
          updates.otherDocuments = docUrls;
          console.log('updates.otherDocuments set to:', updates.otherDocuments);
        } else {
          console.log('docUrls is empty after processing');
        }
      } else {
        console.log('files.otherDocuments is empty or missing');
      }

      if (Object.keys(updates).length > 0) {
        console.log('Updating DB with:', updates);
        await this.prisma.accountMaster.update({
          where: { id: account.id },
          data: updates
        });
        console.log('DB Update SUCCESSFUL');
      } else {
        console.log('No updates to perform (no files successfully moved)');
      }
      console.log('--- handleFileUploads ENDED ---');
    } catch (error) {
      console.error('--- handleFileUploads FAILED ---');
      console.error(error);
    }
  }

  async create(createDto: CreateAccountMasterDto, userId: number, files?: any) {
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

        userId: userId,

        supplierCode,
        supplierCreditDays: createDto.supplierCreditDays,
        supplierOpeningBalance: createDto.supplierOpeningBalance,
        supplierBalanceType: createDto.supplierBalanceType,

        customerCode,
        customerCreditDays: createDto.customerCreditDays,
        customerOpeningBalance: createDto.customerOpeningBalance,
        customerBalanceType: createDto.customerBalanceType,
        customerType: createDto.customerType,

        msmeEnabled: createDto.msmeEnabled || false,
        msmeId: createDto.msmeEnabled ? createDto.msmeId : null,
        regUnder: createDto.msmeEnabled ? createDto.regUnder : null,
        regType: createDto.msmeEnabled ? createDto.regType : null,
        msmeCertificateUrl: createDto.msmeEnabled ? createDto.msmeCertificateUrl : null,

        otherDocuments: createDto.otherDocuments ? createDto.otherDocuments : Prisma.DbNull,
        status: createDto.status || MasterStatus.ACTIVE
      },
    });

    await this.handleFileUploads(account, files);
    
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
      const groups = filter.groupName.split(',').map(g => g.trim().toUpperCase()).filter(g => g !== '');
      if (groups.length > 0) {
        where.groupName = { hasSome: groups };
      }
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
      customerType: updateDto.customerType,
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
    
    await this.handleFileUploads(updated, files);
    
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

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = now.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const d = pad(now.getDate());
    const m = pad(now.getMonth() + 1);
    const yyyy = now.getFullYear();
    const hr = pad(formattedHours);
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());
    const timestamp = `${d}/${m}/${yyyy}, ${hr}:${min}:${sec} ${ampm}`;

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Accounts');

      // Mandatory Column Sequence
      worksheet.columns = [
        { header: 'Customer Code', key: 'customerCode', width: 15 },
        { header: 'Supplier Code', key: 'supplierCode', width: 15 },
        { header: 'Account Name', key: 'accountName', width: 30 },
        { header: 'Group Name', key: 'groupName', width: 25 },
        { header: 'Customer Credit Day', key: 'customerCreditDays', width: 18 },
        { header: 'Supplier Credit Day', key: 'supplierCreditDays', width: 18 },
        { header: 'GST NO', key: 'gstNo', width: 20 },
        { header: 'PAN NO', key: 'panNo', width: 15 },
        { header: 'Customer Op Balance', key: 'customerOpeningBalance', width: 18 },
        { header: 'Supplier Op Balance', key: 'supplierOpeningBalance', width: 18 },
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
          customerCreditDays: acc.customerCreditDays || 0,
          supplierCreditDays: acc.supplierCreditDays || 0,
          gstNo: acc.gstNo || '-',
          panNo: acc.panNo,
          customerOpeningBalance: acc.customerOpeningBalance ? `${acc.customerOpeningBalance} ${acc.customerBalanceType || 'Dr'}` : '0',
          supplierOpeningBalance: acc.supplierOpeningBalance ? `${acc.supplierOpeningBalance} ${acc.supplierBalanceType || 'Dr'}` : '0',
          address: fullAddress,
          status: acc.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive',
        });
      });

      // Shift rows to make room for titles
      worksheet.spliceRows(1, 0, [], [], [], []);

      worksheet.mergeCells('A1:L1');
      worksheet.getCell('A1').value = 'ERP';
      worksheet.getCell('A1').font = { size: 18, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells('A2:L2');
      worksheet.getCell('A2').value = 'Account Master Report';
      worksheet.getCell('A2').font = { size: 14 };
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells('A3:L3');
      worksheet.getCell('A3').value = `Exported on: ${timestamp}`;
      worksheet.getCell('A3').font = { size: 10 };
      worksheet.getCell('A3').alignment = { horizontal: 'right', vertical: 'middle' };

      // Professional Styling
      const headerRow = worksheet.getRow(5);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Professional Blue
      };
      headerRow.alignment = { horizontal: 'center' };

      // Add Autofilter
      worksheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: 5, column: 12 },
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
        doc.fontSize(18).font('Helvetica-Bold').text('ERP', { align: 'center' });
        doc.fontSize(14).font('Helvetica').text('Account Master Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Exported on: ${timestamp}`, { align: 'right' });
        doc.moveDown();

        // Table Constants
        const tableTop = 100;
        const colX = [20, 65, 110, 190, 260, 310, 360, 430, 495, 555, 615, 785];
        const headers = [
          'Cust Code', 'Supp Code', 'Acc Name', 'Groups', 'C.Cr Day', 'S.Cr Day',
          'GST NO', 'PAN NO', 'C.Op Bal', 'S.Op Bal', 'Address', 'Status'
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
          doc.text(acc.customerCode || '-', colX[0], y, { width: 45, lineBreak: true });
          doc.text(acc.supplierCode || '-', colX[1], y, { width: 45, lineBreak: true });
          doc.text(acc.accountName.substring(0, 30), colX[2], y, { width: 85, lineBreak: true });
          doc.text(acc.groupName.join(', ').replace('_', ' '), colX[3], y, { width: 75, lineBreak: true });
          doc.text(String(acc.customerCreditDays || 0), colX[4], y, { width: 50, lineBreak: false });
          doc.text(String(acc.supplierCreditDays || 0), colX[5], y, { width: 50, lineBreak: false });
          doc.text(acc.gstNo || '-', colX[6], y, { width: 70, lineBreak: true });
          doc.text(acc.panNo, colX[7], y, { width: 65, lineBreak: true });
          doc.text(acc.customerOpeningBalance ? `${acc.customerOpeningBalance} ${acc.customerBalanceType || 'Dr'}` : '0', colX[8], y, { width: 60, lineBreak: false });
          doc.text(acc.supplierOpeningBalance ? `${acc.supplierOpeningBalance} ${acc.supplierBalanceType || 'Dr'}` : '0', colX[9], y, { width: 60, lineBreak: false });
          doc.text(fullAddress.substring(0, 90), colX[10], y, { width: 170, lineBreak: true });
          doc.text(acc.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive', colX[11], y, { width: 40, lineBreak: false });
          
          y += 20;
        });

        doc.end();
      });
    }

    throw new BadRequestException('Format is required. Please use xlsx or pdf.');
  }
}
