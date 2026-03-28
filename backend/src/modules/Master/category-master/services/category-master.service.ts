import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { MasterStatus } from '@prisma/client';
import { CategoryMasterRepository } from '../repositories/category-master.repository';
import { CreateCategoryDto, CreateSubCategoryDto, ToggleStatusDto, UpdateCategoryDto, UpdateSubCategoryDto } from '../dto/category.dto';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class CategoryMasterService {
    constructor(private repository: CategoryMasterRepository) { }

    async createCategory(dto: CreateCategoryDto, userId: number) {
        const name = dto.name.trim();
        if (!name) {
            throw new BadRequestException('Category name cannot be empty');
        }

        const existing = await this.repository.findCategoryByName(name, userId);
        if (existing) {
            throw new ConflictException('Category with this name already exists for this user');
        }

        return this.repository.createCategory({
            name,
            user_id: userId,
            status: dto.status,
        });
    }

    async createSubCategory(dto: CreateSubCategoryDto, userId: number) {
        const name = dto.name.trim();
        if (!name) {
            throw new BadRequestException('Sub Category name cannot be empty');
        }

        // Check if category exists and belongs to user
        const category = await this.repository.findCategoryById(dto.category_id);
        if (!category || category.user_id !== userId) {
            throw new NotFoundException('Category not found or does not belong to you');
        }

        // Check if category is ACTIVE
        if (category.status === MasterStatus.INACTIVE) {
            throw new BadRequestException('Cannot create Sub Category under an INACTIVE Category');
        }

        const existing = await this.repository.findSubCategoryByName(name, dto.category_id, userId);
        if (existing) {
            throw new ConflictException('Sub Category with this name already exists in this category');
        }

        return this.repository.createSubCategory({
            name,
            category_id: dto.category_id,
            user_id: userId,
            status: dto.status,
        });
    }

    async getCategoriesForDropdown(userId: number, excludeId?: number) {
        // As per instructions, only Categories (from categories table) are shown
        return this.repository.getCategoriesForDropdown(userId, excludeId);
    }

    async getCategoryListing(userId: number) {
        return this.repository.getCategoryWithSubCategories(userId);
    }

    async toggleCategoryStatus(id: number, dto: ToggleStatusDto, userId: number) {
        const category = await this.repository.findCategoryById(id);
        if (!category || category.user_id !== userId) {
            throw new NotFoundException('Category not found or does not belong to you');
        }

        const updatedCategory = await this.repository.toggleCategoryStatus(id, dto.status);

        // If Category is set to INACTIVE, set all its Sub Categories to INACTIVE
        if (dto.status === MasterStatus.INACTIVE) {
            await this.repository.updateSubCategoriesStatusByCategory(id, MasterStatus.INACTIVE);
        }

        return updatedCategory;
    }

    async toggleSubCategoryStatus(id: number, dto: ToggleStatusDto, userId: number) {
        const subCategory = await this.repository.findSubCategoryById(id);

        if (!subCategory || subCategory.user_id !== userId) {
            throw new NotFoundException('Sub Category not found or does not belong to you');
        }

        // If activating Sub Category, check if parent Category is ACTIVE
        if (dto.status === MasterStatus.ACTIVE) {
            const category = await this.repository.findCategoryById(subCategory.category_id);
            if (!category || category.status === MasterStatus.INACTIVE) {
                throw new BadRequestException('Cannot activate Sub Category while parent Category is INACTIVE');
            }
        }

        return this.repository.toggleSubCategoryStatus(id, dto.status);
    }

    async updateCategory(id: number, dto: { name: string }, userId: number) {
        const name = dto.name.trim();
        if (!name) throw new BadRequestException('Category name cannot be empty');

        const category = await this.repository.findCategoryById(id);
        if (!category || category.user_id !== userId) throw new NotFoundException('Category not found or does not belong to you');

        const existing = await this.repository.findCategoryByName(name, userId);
        if (existing && existing.id !== id) {
            throw new ConflictException('Category with this name already exists');
        }

        return this.repository.updateCategoryData(id, { name });
    }

    async updateSubCategory(id: number, dto: UpdateSubCategoryDto, userId: number) {
        const name = dto.name.trim();
        if (!name) throw new BadRequestException('Sub Category name cannot be empty');

        const subCategory = await this.repository.findSubCategoryById(id);
        if (!subCategory || subCategory.user_id !== userId) throw new NotFoundException('Sub Category not found or does not belong to you');

        // Check if category_id is being changed
        const newCategoryId = dto.category_id || subCategory.category_id;
        if (newCategoryId !== subCategory.category_id) {
            const newCategory = await this.repository.findCategoryById(newCategoryId);
            if (!newCategory || newCategory.user_id !== userId) {
                throw new BadRequestException('Selected category is invalid');
            }
        }

        const existing = await this.repository.findSubCategoryByName(name, newCategoryId, userId);
        if (existing && existing.id !== id) {
            throw new ConflictException('Sub Category with this name already exists in this category');
        }

        return this.repository.updateSubCategoryContent(id, name, dto.category_id);
    }

    async importCategories(buffer: Buffer, userId: number) {
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

        let importedCategories = 0;
        let importedSubCategories = 0;
        let failed = 0;
        const errors: string[] = [];

        let headerRowIndex = -1;
        const colMap: Record<string, number> = {};

        for (let r = 1; r <= Math.min(rowCount, 10); r++) {
            const row = worksheet.getRow(r);
            let foundHeaders = false;
            row.eachCell((cell, colNumber) => {
                const val = String(cell.value || '').trim().toLowerCase();
                if (val === 'category' || val === 'category name') { colMap['categoryName'] = colNumber; foundHeaders = true; }
                if (val === 'sub category' || val === 'sub category name') colMap['subCategoryName'] = colNumber;
            });

            if (foundHeaders) {
                headerRowIndex = r;
                break;
            }
        }

        if (headerRowIndex === -1) {
            throw new BadRequestException('Could not find Category name column in the provided Excel file.');
        }

        const getVal = (row: ExcelJS.Row, key: string, defaultVal: any = '') => {
            const colIdx = colMap[key];
            if (!colIdx) return defaultVal;
            return row.getCell(colIdx).value;
        };

        let currentCategoryId: number | null = null;

        for (let i = headerRowIndex + 1; i <= rowCount; i++) {
            const row = worksheet.getRow(i);
            const rawCategoryName = String(getVal(row, 'categoryName')).trim();
            const rawSubCategoryName = String(getVal(row, 'subCategoryName')).trim();

            if (!rawCategoryName && !rawSubCategoryName) continue; // Empty row
            if (rawCategoryName === '-' && rawSubCategoryName === '-') continue;

            try {
                if (rawCategoryName) {
                    // Try to find or create category
                    let category = await this.repository.findCategoryByName(rawCategoryName, userId);
                    if (!category) {
                        category = await this.repository.createCategory({
                            name: rawCategoryName,
                            user_id: userId,
                            status: MasterStatus.ACTIVE,
                        });
                        importedCategories++;
                    }
                    currentCategoryId = category.id;
                }

                if (rawSubCategoryName) {
                    if (!currentCategoryId) {
                        throw new BadRequestException('Sub category found without a parent category preceding it');
                    }
                    const existingSub = await this.repository.findSubCategoryByName(rawSubCategoryName, currentCategoryId, userId);
                    if (!existingSub) {
                        await this.repository.createSubCategory({
                            name: rawSubCategoryName,
                            category_id: currentCategoryId,
                            user_id: userId,
                            status: MasterStatus.ACTIVE,
                        });
                        importedSubCategories++;
                    }
                }
            } catch (error) {
                failed++;
                errors.push(`Row ${i} (${rawCategoryName || rawSubCategoryName}): ${error.message}`);
            }
        }

        if (importedCategories === 0 && importedSubCategories === 0 && failed > 0) {
            throw new BadRequestException(`Import failed: ${errors[0]}`);
        }

        if (importedCategories === 0 && importedSubCategories === 0 && failed === 0) {
            throw new BadRequestException('No data found to import');
        }

        return {
            success: true,
            message: `Imported ${importedCategories} categories and ${importedSubCategories} sub-categories. ${failed > 0 ? failed + ' rows failed.' : ''}`,
            errors: failed > 0 ? errors : undefined,
        };
    }

    async promoteSubCategory(id: number, userId: number) {
        try {
            return await this.repository.promoteSubCategory(id, userId);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async demoteCategory(id: number, newParentId: number, userId: number) {
        try {
            return await this.repository.demoteCategoryToSubCategory(id, newParentId, userId);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    private flattenCategories(categories: any[]): any[] {
        const flat: any[] = [];
        categories.forEach(cat => {
            flat.push({
                type: 'Category',
                category_name: cat.name,
                sub_category: '-'
            });
            if (cat.sub_categories && cat.sub_categories.length > 0) {
                cat.sub_categories.forEach(sub => {
                    flat.push({
                        type: 'Sub Category',
                        category_name: cat.name,
                        sub_category: sub.name
                    });
                });
            }
        });
        return flat;
    }

    async exportCategories(format: string, userId: number) {
        const categories = await this.getCategoryListing(userId);
        const flatData = this.flattenCategories(categories);

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}, ${pad(now.getHours() % 12 || 12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${now.getHours() >= 12 ? 'pm' : 'am'}`;

        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Category Master');

            worksheet.columns = [
                { header: 'Type', key: 'type', width: 20 },
                { header: 'Category Name', key: 'category_name', width: 30 },
                { header: 'Sub Category', key: 'sub_category', width: 30 },
            ];

            flatData.forEach(row => worksheet.addRow(row));

            worksheet.spliceRows(1, 0, [], [], [], []);

            worksheet.mergeCells('A1:C1');
            worksheet.getCell('A1').value = 'ERP';
            worksheet.getCell('A1').font = { size: 18, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A2:C2');
            worksheet.getCell('A2').value = 'Category Master Report';
            worksheet.getCell('A2').font = { size: 14 };
            worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A3:C3');
            worksheet.getCell('A3').value = `Exported on: ${timestamp}`;
            worksheet.getCell('A3').font = { size: 10 };
            worksheet.getCell('A3').alignment = { horizontal: 'right', vertical: 'middle' };

            const headerRow = worksheet.getRow(5);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            headerRow.alignment = { horizontal: 'center' };

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber >= 5) {
                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            return {
                buffer: Buffer.from(buffer),
                filename: `category_master_${Date.now()}.xlsx`,
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
        }

        if (format === 'pdf') {
            return new Promise<any>((resolve) => {
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                const buffers: Buffer[] = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    resolve({
                        buffer: Buffer.concat(buffers),
                        filename: `category_master_${Date.now()}.pdf`,
                        mimetype: 'application/pdf',
                    });
                });

                doc.fontSize(18).font('Helvetica-Bold').text('ERP', { align: 'center' });
                doc.fontSize(14).font('Helvetica').text('Category Master Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Exported on: ${timestamp}`, { align: 'right' });
                doc.moveDown();

                const tableTop = 120;
                const colX = [50, 150, 350];
                const headers = ['Type', 'Category Name', 'Sub Category'];

                doc.rect(45, tableTop - 5, 500, 20).fill('#4472C4');
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
                headers.forEach((h, i) => doc.text(h, colX[i], tableTop));

                let y = tableTop + 20;
                doc.fillColor('#000000').font('Helvetica');

                flatData.forEach((row, index) => {
                    if (y > 750) {
                        doc.addPage();
                        y = 50;
                    }

                    if (index % 2 === 1) doc.rect(45, y - 3, 500, 15).fill('#F2F2F2').fillColor('#000000');
                    doc.fontSize(9);
                    doc.text(row.type, colX[0], y);
                    doc.text(row.category_name, colX[1], y);
                    doc.text(row.sub_category, colX[2], y);
                    y += 20;
                });
                doc.end();
            });
        }
        throw new BadRequestException('Format is required. Please use xlsx or pdf.');
    }
}
