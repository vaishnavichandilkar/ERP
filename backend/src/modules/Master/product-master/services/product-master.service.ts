import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductMasterRepository } from '../repositories/product-master.repository';
import { CreateProductDto, UpdateProductDto, ToggleProductStatusDto } from '../dto/product.dto';
import { MasterStatus, ProductType } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

interface GetProductsQuery {
    page?: number;
    limit?: number;
    search?: string;
    uom_id?: number;
    product_type?: string;
    status?: string;
}

@Injectable()
export class ProductMasterService {
    constructor(private readonly repository: ProductMasterRepository) { }

    // ... existing methods ...

    async exportProducts(format: string, query: GetProductsQuery, userId: number) {
        const result = await this.getProducts({ ...query, page: 1, limit: 10000 }, userId);
        const products = result.products;

        if (products.length === 0) {
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
            const worksheet = workbook.addWorksheet('Products');

            worksheet.columns = [
                { header: 'Sr. No', key: 'srNo', width: 10 },
                { header: 'Prod Code', key: 'productCode', width: 15 },
                { header: 'Product Name', key: 'productName', width: 30 },
                { header: 'UOM', key: 'uom', width: 15 },
                { header: 'Type', key: 'productType', width: 15 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Sub Category', key: 'subCategory', width: 20 },
                { header: 'HSN Code', key: 'hsnCode', width: 15 },
                { header: 'Tax %', key: 'taxRate', width: 10 },
                { header: 'Status', key: 'status', width: 12 },
            ];

            (products as any[]).forEach((prod, index) => {
                worksheet.addRow({
                    srNo: index + 1,
                    productCode: prod.product_code,
                    productName: prod.product_name,
                    uom: prod.uom?.unit_name || '-',
                    productType: prod.product_type,
                    category: prod.category?.name || '-',
                    subCategory: prod.sub_category?.name || '-',
                    hsnCode: prod.hsn_code,
                    taxRate: `${prod.tax_rate}%`,
                    status: prod.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive',
                });
            });

            worksheet.spliceRows(1, 0, [], [], [], []);

            worksheet.mergeCells('A1:J1');
            worksheet.getCell('A1').value = 'ERP';
            worksheet.getCell('A1').font = { size: 18, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A2:J2');
            worksheet.getCell('A2').value = 'Product Master Report';
            worksheet.getCell('A2').font = { size: 14 };
            worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A3:J3');
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

            const buffer = await workbook.xlsx.writeBuffer();
            return {
                buffer: Buffer.from(buffer),
                filename: `products_export_${Date.now()}.xlsx`,
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
        }

        if (format === 'pdf') {
            return new Promise<any>((resolve) => {
                const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve({
                        buffer: pdfData,
                        filename: `products_export_${Date.now()}.pdf`,
                        mimetype: 'application/pdf',
                    });
                });

                doc.fontSize(18).font('Helvetica-Bold').text('ERP', { align: 'center' });
                doc.fontSize(14).font('Helvetica').text('Product Master Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Exported on: ${timestamp}`, { align: 'right' });
                doc.moveDown();

                const tableTop = 100;
                const colX = [20, 50, 110, 230, 280, 340, 440, 540, 620, 680];
                const headers = [
                    'Sr.', 'Prod Code', 'Product Name', 'UOM', 'Type',
                    'Category', 'Sub Category', 'HSN', 'Tax%', 'Status'
                ];

                doc.rect(15, tableTop - 5, 805, 20).fill('#4472C4');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');

                headers.forEach((header, i) => {
                    doc.text(header, colX[i], tableTop);
                });

                let y = tableTop + 20;
                doc.fillColor('#000000').font('Helvetica');

                products.forEach((prod: any, index) => {
                    if (y > 550) {
                        doc.addPage({ margin: 20, size: 'A4', layout: 'landscape' });
                        y = 40;
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

                    doc.fontSize(7);
                    doc.text((index + 1).toString(), colX[0], y);
                    doc.text(prod.product_code, colX[1], y);
                    doc.text(prod.product_name, colX[2], y, { width: 110 });
                    doc.text(prod.uom?.unit_name || '-', colX[3], y);
                    doc.text(prod.product_type, colX[4], y);
                    doc.text(prod.category?.name || '-', colX[5], y, { width: 90 });
                    doc.text(prod.sub_category?.name || '-', colX[6], y, { width: 90 });
                    doc.text(prod.hsn_code, colX[7], y);
                    doc.text(`${prod.tax_rate}%`, colX[8], y);
                    doc.text(prod.status === MasterStatus.ACTIVE ? 'Active' : 'Inactive', colX[9], y);

                    y += 18;
                });

                doc.end();
            });
        }

        throw new BadRequestException('Format is required. Please use xlsx or pdf.');
    }

    async generateProductCode(userId: number): Promise<string> {
        const lastCode = await this.repository.getLastProductCode(userId);
        if (!lastCode) {
            return 'PD00001';
        }

        // Extract numeric part using regex to be robust
        const match = lastCode.match(/\d+/);
        if (!match) {
            return 'PD00001';
        }

        const numericPart = parseInt(match[0], 10);
        const nextNumeric = numericPart + 1;
        return `PD${nextNumeric.toString().padStart(5, '0')}`;
    }

    async generateCodeForUser(userId: number) {
        const product_code = await this.generateProductCode(userId);
        return { product_code };
    }

    async getUomDropdown(userId: number) {
        return this.repository.getActiveUomsForDropdown(userId);
    }

    async getTaxByHsn(hsnCode: string) {
        const hsn = await this.repository.getHsnByCode(hsnCode);
        if (!hsn) throw new NotFoundException('HSN Code not found');
        return { tax_rate: Number(hsn.gst_rate) };
    }

    async getCategoryDropdown(userId: number) {
        return this.repository.getActiveCategoriesForDropdown(userId);
    }

    async getSubCategoryDropdown(categoryId: number, userId: number) {
        return this.repository.getActiveSubCategoriesForDropdown(categoryId, userId);
    }

    async createProduct(dto: CreateProductDto, userId: number) {
        // Uniqueness check
        const existing = await this.repository.findByProductName(dto.product_name, userId);
        if (existing) {
            throw new BadRequestException('Product name already exists');
        }

        const uom = await this.repository.getUomById(dto.uom_id);
        if (!uom || uom.user_id !== userId) throw new BadRequestException('No units found for this user');

        const category = await this.repository.getCategoryById(dto.category_id);
        if (!category) throw new BadRequestException('Invalid Category ID');

        const subCategory = await this.repository.getSubCategoryById(dto.sub_category_id);
        if (!subCategory || subCategory.category_id !== dto.category_id) {
            throw new BadRequestException('Invalid Sub Category ID or it does not belong to the selected Category');
        }

        const hsn = await this.repository.getHsnByCode(dto.hsn_code);
        if (!hsn) throw new BadRequestException('HSN Code not found in master');

        const product_code = await this.generateProductCode(userId);

        return this.repository.createProduct({
            product_name: dto.product_name,
            product_code,
            uom_id: dto.uom_id,
            product_type: dto.product_type as ProductType,
            category_id: dto.category_id,
            sub_category_id: dto.sub_category_id,
            hsn_code: dto.hsn_code,
            tax_rate: Number(hsn.gst_rate),
            description: dto.description,
            created_by: userId
        });
    }

    async updateProduct(id: number, dto: UpdateProductDto, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');

        if (dto.product_name && dto.product_name !== product.product_name) {
            const existing = await this.repository.findByProductName(dto.product_name, userId);
            if (existing && existing.id !== id) {
                throw new BadRequestException('Product name already exists');
            }
        }

        const updateData: any = { ...dto };

        if (dto.uom_id) {
            const uom = await this.repository.getUomById(dto.uom_id);
            if (!uom || uom.user_id !== userId) throw new BadRequestException('No units found for this user');
        }

        if (dto.category_id || dto.sub_category_id) {
            const catId = dto.category_id || product.category_id;
            const subCatId = dto.sub_category_id || product.sub_category_id;
            const subCategory = await this.repository.getSubCategoryById(subCatId);
            if (!subCategory || subCategory.category_id !== catId) {
                throw new BadRequestException('Invalid Category/Sub Category relation');
            }
        }

        if (dto.hsn_code) {
            const hsn = await this.repository.getHsnByCode(dto.hsn_code);
            if (!hsn) throw new BadRequestException('HSN Code not found in master');
            updateData.tax_rate = Number(hsn.gst_rate);
        }

        return this.repository.updateProduct(id, updateData);
    }

    async getProductNameSuggestions(name: string, userId: number) {
        if (!name || name.length < 2) return [];
        const products = await this.repository.getProductNameSuggestions(name, userId);
        return products.map(p => p.product_name);
    }

    async checkProductNameUnique(name: string, userId: number, excludeId?: number) {
        const existing = await this.repository.findByProductName(name, userId);
        if (existing && (!excludeId || existing.id !== excludeId)) {
            return { isUnique: false };
        }
        return { isUnique: true };
    }

    async getProducts(query: GetProductsQuery, userId: number) {
        const page = query.page ? parseInt(query.page.toString(), 10) : 1;
        const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;
        const skip = (page - 1) * limit;

        let status: any = undefined;
        if (query.status === 'ACTIVE' || query.status === 'INACTIVE') {
            status = query.status;
        }

        let product_type: any = undefined;
        if (query.product_type === 'GOODS' || query.product_type === 'SERVICES') {
            product_type = query.product_type;
        }

        return this.repository.getProducts({
            skip,
            take: limit,
            searchTerm: query.search,
            uom_id: query.uom_id ? parseInt(query.uom_id.toString(), 10) : undefined,
            product_type,
            status,
            created_by: userId,
            isExport: (query as any).isExport
        });
    }

    async getProductById(id: number, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return product;
    }

    async toggleStatus(id: number, dto: ToggleProductStatusDto, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return this.repository.toggleStatus(id, dto.status as MasterStatus);
    }

    async deleteProduct(id: number, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return this.repository.softDelete(id);
    }
}
