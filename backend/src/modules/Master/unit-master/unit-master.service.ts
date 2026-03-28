import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, UnitQueryDto, UpdateUnitStatusDto } from './dto/unit-master.dto';
import { UnitSource, UnitStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class UnitMasterService {
    constructor(private prisma: PrismaService) { }

    async getUnitLibrary(query?: { search?: string; gst_uom?: string; unit_name?: string }) {
        const where: any = {};
        if (query?.unit_name) {
            where.unit_name = query.unit_name;
        }
        if (query?.search) {
            where.OR = [
                { full_name_of_measurement: { contains: query.search, mode: 'insensitive' } },
                { unit_name: { contains: query.search, mode: 'insensitive' } },
                { uom_code: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query?.gst_uom) {
            where.uom_code = query.gst_uom;
        }

        const list = await this.prisma.systemUomLibrary.findMany({
            where,
            orderBy: { full_name_of_measurement: 'asc' }
        });

        return {
            data: list.map(item => ({
                full_name_of_measurement: item.full_name_of_measurement,
                unit_name: item.unit_name,
                gst_uom: item.uom_code
            }))
        };
    }

    async getDistinctUnitNames() {
        const result = await this.prisma.systemUomLibrary.findMany({
            distinct: ['unit_name'],
            select: { unit_name: true },
            orderBy: { unit_name: 'asc' }
        });
        return { data: result.map(r => r.unit_name) };
    }

    async getDistinctGstUoms() {
        const result = await this.prisma.systemUomLibrary.findMany({
            distinct: ['uom_code'],
            select: { uom_code: true },
            orderBy: { uom_code: 'asc' }
        });
        return { data: result.map(r => r.uom_code) };
    }

    async getUomByUnitName(unitName: string) {
        const result = await this.prisma.systemUomLibrary.findMany({
            where: { unit_name: unitName },
            select: { uom_code: true },
            distinct: ['uom_code'],
            orderBy: { uom_code: 'asc' }
        });
        return { data: result.map(r => r.uom_code) };
    }

    async getMeasurementByUom(uomCode: string) {
        const result = await this.prisma.systemUomLibrary.findFirst({
            where: { uom_code: uomCode },
            select: { full_name_of_measurement: true }
        });
        if (!result) {
            throw new NotFoundException(`Measurement for UOM code ${uomCode} not found`);
        }
        return { data: result.full_name_of_measurement };
    }

    async addUnit(userId: number, dto: CreateUnitDto) {
        // 1. Check if same unit already exists for user (Check by user_id + gst_uom)
        const existingForUser = await this.prisma.unitMaster.findFirst({
            where: {
                user_id: userId,
                gst_uom: dto.gst_uom
            }
        });
        if (existingForUser) {
            throw new ConflictException('Unit already added');
        }

        // 2. Check if it exists in system library
        const libraryMatch = await this.prisma.systemUomLibrary.findFirst({
            where: { uom_code: dto.gst_uom }
        });

        let source: UnitSource = UnitSource.USER;
        if (libraryMatch) {
            // If it exists in system library, we force its source as SYSTEM
            // The user requested: "If the selected unit exists in the system library, save it in unit_master with source = SYSTEM"
            source = UnitSource.SYSTEM;
        }

        return this.prisma.unitMaster.create({
            data: {
                user_id: userId,
                unit_name: dto.unit_name,
                gst_uom: dto.gst_uom,
                full_name_of_measurement: dto.full_name_of_measurement,
                source: source,
                status: UnitStatus.ACTIVE
            }
        });
    }

    async createUnit(userId: number, dto: CreateUnitDto) {
        return this.addUnit(userId, dto);
    }

    async getUnitsList(userId: number, query: UnitQueryDto) {
        const { search, gst_uom, unit_name, full_name_of_measurement, status, page = '1', limit = '10', sortBy = 'created_at', sortOrder = 'desc' } = query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = { user_id: userId };
        if (search) {
            where.OR = [
                { unit_name: { contains: search, mode: 'insensitive' } },
                { full_name_of_measurement: { contains: search, mode: 'insensitive' } },
                { gst_uom: { contains: search, mode: 'insensitive' } }
            ];

            // Include status in "search anything" if it matches
            const searchLower = search.toLowerCase();
            if ("active".includes(searchLower)) {
                where.OR.push({ status: UnitStatus.ACTIVE });
            }
            if ("inactive".includes(searchLower)) {
                where.OR.push({ status: UnitStatus.INACTIVE });
            }
        }
        if (gst_uom) {
            where.gst_uom = gst_uom;
        }
        if (unit_name) {
            where.unit_name = unit_name;
        }
        if (full_name_of_measurement) {
            where.full_name_of_measurement = { contains: full_name_of_measurement, mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }

        const [items, total] = await Promise.all([
            this.prisma.unitMaster.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder }
            }),
            this.prisma.unitMaster.count({ where })
        ]);

        return {
            data: items,
            meta: {
                total,
                page: parseInt(page),
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        };
    }

    async getUnitById(userId: number, id: number) {
        const unit = await this.prisma.unitMaster.findFirst({
            where: { id, user_id: userId }
        });
        if (!unit) {
            throw new NotFoundException(`Unit with ID ${id} not found`);
        }
        return unit;
    }

    async updateUnit(userId: number, id: number, dto: UpdateUnitDto) {
        const unit = await this.getUnitById(userId, id);

        if (dto.gst_uom && dto.gst_uom !== unit.gst_uom) {
            const existing = await this.prisma.unitMaster.findFirst({
                where: {
                    user_id: userId,
                    gst_uom: dto.gst_uom,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new ConflictException('Unit already added');
            }
        }

        // Re-evaluate source if fields are updated
        const newUnitName = dto.unit_name ?? unit.unit_name;
        const newGstUom = dto.gst_uom ?? unit.gst_uom;
        const newFullName = dto.full_name_of_measurement ?? unit.full_name_of_measurement;

        const libraryMatch = await this.prisma.systemUomLibrary.findFirst({
            where: {
                full_name_of_measurement: newFullName,
                unit_name: newUnitName,
                uom_code: newGstUom
            }
        });

        const source = libraryMatch ? UnitSource.SYSTEM : UnitSource.USER;

        return this.prisma.unitMaster.update({
            where: { id },
            data: {
                ...dto,
                source: source
            }
        });
    }

    async toggleStatus(userId: number, id: number, dto: UpdateUnitStatusDto) {
        await this.getUnitById(userId, id);

        return this.prisma.unitMaster.update({
            where: { id },
            data: { status: dto.status }
        });
    }

    async importUnits(buffer: Buffer, userId: number) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file format');
        }

        const rowCount = worksheet.rowCount;
        if (rowCount < 2) {
            throw new BadRequestException('No data found to import');
        }

        let importedRows = 0;
        let failed = 0;
        const errors: string[] = [];

        let headerRowIndex = -1;
        const colMap: Record<string, number> = {};

        for (let r = 1; r <= Math.min(rowCount, 10); r++) {
            const row = worksheet.getRow(r);
            let foundHeaders = false;
            row.eachCell((cell, colNumber) => {
                const val = String(cell.value || '').trim().toLowerCase();
                if (val === 'unit' || val === 'unit name') { colMap['unitName'] = colNumber; foundHeaders = true; }
                if (val === 'gst uom' || val === 'gst') colMap['gstUom'] = colNumber;
                if (val === 'full name' || val === 'full name of measurement') colMap['fullName'] = colNumber;
                if (val === 'status') colMap['status'] = colNumber;
            });

            if (foundHeaders) {
                headerRowIndex = r;
                break;
            }
        }

        if (headerRowIndex === -1) {
            throw new BadRequestException('Could not find Unit Name column in the provided Excel file.');
        }

        const getVal = (row: ExcelJS.Row, key: string, defaultVal: any = '') => {
            const colIdx = colMap[key];
            if (!colIdx) return defaultVal;
            return row.getCell(colIdx).value;
        };

        for (let i = headerRowIndex + 1; i <= rowCount; i++) {
            const row = worksheet.getRow(i);

            const unitName = String(getVal(row, 'unitName')).trim();
            if (!unitName || unitName === '-') continue;

            const gstUom = String(getVal(row, 'gstUom')).trim();
            const fullName = String(getVal(row, 'fullName')).trim();
            const statusStr = String(getVal(row, 'status')).trim().toUpperCase();

            if (!unitName || !gstUom) {
                failed++;
                errors.push(`Row ${i} missing required Unit Name or GST UOM.`);
                continue;
            }

            try {
                const status = statusStr === 'INACTIVE' ? UnitStatus.INACTIVE : UnitStatus.ACTIVE;
                const finalFullName = fullName === '-' ? '' : fullName;

                const existingForUser = await this.prisma.unitMaster.findFirst({
                    where: {
                        user_id: userId,
                        gst_uom: gstUom
                    }
                });

                if (existingForUser) {
                    await this.prisma.unitMaster.update({
                        where: { id: existingForUser.id },
                        data: {
                            unit_name: unitName,
                            full_name_of_measurement: finalFullName,
                            status: status
                        }
                    });
                } else {
                    const libraryMatch = await this.prisma.systemUomLibrary.findFirst({
                        where: { uom_code: gstUom }
                    });

                    let source: UnitSource = libraryMatch ? UnitSource.SYSTEM : UnitSource.USER;

                    await this.prisma.unitMaster.create({
                        data: {
                            user_id: userId,
                            unit_name: unitName,
                            gst_uom: gstUom,
                            full_name_of_measurement: finalFullName,
                            source: source,
                            status: status
                        }
                    });
                }
                importedRows++;
            } catch (error) {
                failed++;
                errors.push(`Row ${i} (${unitName}): ${error.message}`);
            }
        }

        if (importedRows === 0 && failed > 0) {
            throw new BadRequestException(`Import failed: ${errors[0]}`);
        }

        if (importedRows === 0 && failed === 0) {
            throw new BadRequestException('No data found to import');
        }

        return {
            success: true,
            message: `Imported ${importedRows} units. ${failed > 0 ? failed + ' rows failed.' : ''}`,
            errors: failed > 0 ? errors : undefined,
        };
    }

    async exportUnits(format: string, query: UnitQueryDto, userId: number) {
        const result = await this.getUnitsList(userId, { ...query, page: '1', limit: '10000' });
        const units = result.data;

        if (units.length === 0) {
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
            const worksheet = workbook.addWorksheet('Units');

            worksheet.columns = [
                { header: 'Sr. No', key: 'srNo', width: 10 },
                { header: 'Unit Name', key: 'unitName', width: 25 },
                { header: 'GST UOM', key: 'gstUom', width: 15 },
                { header: 'Full Name', key: 'fullName', width: 30 },
                { header: 'Status', key: 'status', width: 12 },
            ];

            units.forEach((unit, index) => {
                worksheet.addRow({
                    srNo: index + 1,
                    unitName: unit.unit_name,
                    gstUom: unit.gst_uom,
                    fullName: unit.full_name_of_measurement || '-',
                    status: unit.status === UnitStatus.ACTIVE ? 'Active' : 'Inactive',
                });
            });

            worksheet.spliceRows(1, 0, [], [], [], []);

            worksheet.mergeCells('A1:E1');
            worksheet.getCell('A1').value = 'ERP';
            worksheet.getCell('A1').font = { size: 18, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A2:E2');
            worksheet.getCell('A2').value = 'Unit Master Report';
            worksheet.getCell('A2').font = { size: 14 };
            worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A3:E3');
            worksheet.getCell('A3').value = `Exported on: ${timestamp}`;
            worksheet.getCell('A3').font = { size: 10 };
            worksheet.getCell('A3').alignment = { horizontal: 'right', vertical: 'middle' };

            const headerRow = worksheet.getRow(5);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            headerRow.alignment = { horizontal: 'center' };

            // Add borders to all cells from header onwards
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber >= 5) {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    });
                }
            });

            // Alignments
            worksheet.getColumn('srNo').alignment = { horizontal: 'center' };
            worksheet.getColumn('status').alignment = { horizontal: 'center' };

            const buffer = await workbook.xlsx.writeBuffer();
            return {
                buffer: Buffer.from(buffer),
                filename: `units_export_${Date.now()}.xlsx`,
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
        }

        if (format === 'pdf') {
            return new Promise<any>((resolve, reject) => {
                const doc = new PDFDocument({ margin: 20, size: 'A4' });
                const buffers: Buffer[] = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve({
                        buffer: pdfData,
                        filename: `units_export_${Date.now()}.pdf`,
                        mimetype: 'application/pdf',
                    });
                });

                doc.fontSize(18).font('Helvetica-Bold').text('ERP', { align: 'center' });
                doc.fontSize(14).font('Helvetica').text('Unit Master Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Exported on: ${timestamp}`, { align: 'right' });
                doc.moveDown();

                const tableTop = 100;
                const colX = [30, 80, 200, 300, 480];
                const headers = ['Sr.', 'Unit Name', 'GST UOM', 'Full Name', 'Status'];

                doc.rect(25, tableTop - 5, 545, 20).fill('#4472C4');
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
                headers.forEach((h, i) => doc.text(h, colX[i], tableTop));

                let y = tableTop + 20;
                doc.fillColor('#000000').font('Helvetica');

                units.forEach((unit: any, index) => {
                    if (y > 750) {
                        doc.addPage();
                        y = 40;
                        doc.rect(25, y - 5, 545, 20).fill('#4472C4');
                        doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
                        headers.forEach((h, i) => doc.text(h, colX[i], y));
                        y += 20;
                        doc.fillColor('#000000').font('Helvetica');
                    }
                    if (index % 2 === 1) doc.rect(25, y - 3, 545, 15).fill('#F2F2F2').fillColor('#000000');
                    doc.fontSize(9);
                    doc.text((index + 1).toString(), colX[0], y);
                    doc.text(unit.unit_name, colX[1], y);
                    doc.text(unit.gst_uom, colX[2], y);
                    doc.text(unit.full_name_of_measurement || '-', colX[3], y);
                    doc.text(unit.status === UnitStatus.ACTIVE ? 'Active' : 'Inactive', colX[4], y);
                    y += 18;
                });
                doc.end();
            });
        }
        throw new BadRequestException('Format is required. Please use xlsx or pdf.');
    }
}
