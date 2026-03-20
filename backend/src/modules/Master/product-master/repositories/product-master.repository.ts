import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Prisma, ProductType, MasterStatus } from '@prisma/client';

@Injectable()
export class ProductMasterRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createProduct(data: Prisma.ProductUncheckedCreateInput) {
        return this.prisma.product.create({ data });
    }

    async getLastProductCode(userId: number): Promise<string | null> {
        const product = await this.prisma.product.findFirst({
            where: { created_by: userId },
            orderBy: { id: 'desc' },
            select: { product_code: true }
        });
        return product?.product_code || null;
    }

    async findProductById(id: number) {
        return this.prisma.product.findUnique({
            where: { id, is_deleted: false },
            include: { uom: true, category: true, sub_category: true, hsn: true }
        });
    }

    async getProducts(params: {
        skip?: number;
        take?: number;
        searchTerm?: string;
        uom_id?: number;
        product_type?: ProductType;
        status?: MasterStatus;
        created_by: number;
    }) {
        const { skip = 0, take = 10, searchTerm, uom_id, product_type, status, created_by } = params;

        const where: Prisma.ProductWhereInput = { is_deleted: false, created_by };

        if (searchTerm) {
            where.OR = [
                { product_name: { contains: searchTerm, mode: 'insensitive' } },
                { product_code: { contains: searchTerm, mode: 'insensitive' } },
                { hsn_code: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        if (uom_id) where.uom_id = uom_id;
        if (product_type) where.product_type = product_type;
        if (status) where.status = status;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: { uom: true, category: true, sub_category: true, hsn: true }
            }),
            this.prisma.product.count({ where })
        ]);

        return { products, total, totalPages: Math.ceil(total / take) };
    }

    async updateProduct(id: number, data: Prisma.ProductUncheckedUpdateInput) {
        return this.prisma.product.update({ where: { id }, data });
    }

    async toggleStatus(id: number, status: MasterStatus) {
        return this.prisma.product.update({ where: { id }, data: { status } });
    }

    async softDelete(id: number) {
        return this.prisma.product.update({ where: { id }, data: { is_deleted: true } });
    }

    async getHsnByCode(hsn_code: string) {
        return this.prisma.hsnMaster.findUnique({ where: { hsn_code } });
    }

    async getUomById(id: number) {
        return this.prisma.unitMaster.findUnique({ where: { id } });
    }

    async getCategoryById(id: number) {
        return this.prisma.category.findUnique({ where: { id } });
    }

    async getSubCategoryById(id: number) {
        return this.prisma.subCategory.findUnique({ where: { id } });
    }

    async getActiveUomsForDropdown(userId: number) {
        return this.prisma.unitMaster.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            select: { id: true, unit_name: true, gst_uom: true, full_name_of_measurement: true },
            orderBy: { unit_name: 'asc' }
        });
    }

    async getActiveCategoriesForDropdown(userId: number) {
        return this.prisma.category.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    }

    async getActiveSubCategoriesForDropdown(categoryId: number, userId: number) {
        return this.prisma.subCategory.findMany({
            where: { category_id: categoryId, user_id: userId, status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    }
}
