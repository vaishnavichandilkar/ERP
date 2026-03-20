import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductMasterRepository } from '../repositories/product-master.repository';
import { CreateProductDto, UpdateProductDto, ToggleProductStatusDto } from '../dto/product.dto';

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

    async generateProductCode(userId: number): Promise<string> {
        const lastCode = await this.repository.getLastProductCode(userId);
        if (!lastCode) {
            return 'PRD001';
        }
        const numericPart = parseInt(lastCode.replace('PD', ''), 10);
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

    async getCategoryDropdown(userId: number) {
        return this.repository.getActiveCategoriesForDropdown(userId);
    }

    async getSubCategoryDropdown(categoryId: number, userId: number) {
        return this.repository.getActiveSubCategoriesForDropdown(categoryId, userId);
    }

    async createProduct(dto: CreateProductDto, userId: number) {
        // Validate UOM
        const uom = await this.repository.getUomById(dto.uom_id);
        if (!uom || uom.user_id !== userId) throw new BadRequestException('No units found for this user');

        // Validate Category
        const category = await this.repository.getCategoryById(dto.category_id);
        if (!category) throw new BadRequestException('Invalid Category ID');

        // Validate Sub Category and its relation
        const subCategory = await this.repository.getSubCategoryById(dto.sub_category_id);
        if (!subCategory || subCategory.category_id !== dto.category_id) {
            throw new BadRequestException('Invalid Sub Category ID or it does not belong to the selected Category');
        }

        // Validate HSN and fetch tax
        const hsn = await this.repository.getHsnByCode(dto.hsn_code);
        if (!hsn) throw new BadRequestException('HSN Code not found in master');

        const product_code = await this.generateProductCode(userId);

        return this.repository.createProduct({
            product_name: dto.product_name,
            product_code,
            uom_id: dto.uom_id,
            product_type: dto.product_type,
            category_id: dto.category_id,
            sub_category_id: dto.sub_category_id,
            hsn_code: dto.hsn_code,
            tax_rate: Number(hsn.gst_rate),
            description: dto.description,
            created_by: userId
        });
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
            created_by: userId
        });
    }

    async getProductById(id: number, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return product;
    }

    async updateProduct(id: number, dto: UpdateProductDto, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');

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

    async toggleStatus(id: number, dto: ToggleProductStatusDto, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return this.repository.toggleStatus(id, dto.status);
    }

    async deleteProduct(id: number, userId: number) {
        const product = await this.repository.findProductById(id);
        if (!product || product.created_by !== userId) throw new NotFoundException('Product not found');
        return this.repository.softDelete(id);
    }
}
