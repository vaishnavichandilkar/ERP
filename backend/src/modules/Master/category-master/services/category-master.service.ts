import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { MasterStatus } from '@prisma/client';
import { CategoryMasterRepository } from '../repositories/category-master.repository';
import { CreateCategoryDto, CreateSubCategoryDto, ToggleStatusDto, UpdateCategoryDto, UpdateSubCategoryDto } from '../dto/category.dto';

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

    async getCategoriesForDropdown(userId: number) {
        return this.repository.getCategoriesForDropdown(userId);
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
        // We could add more checks here if needed, but for status toggle, id should be enough if checked against userId
        // Let's verify ownership first
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

        return this.repository.updateCategoryName(id, name);
    }

    async updateSubCategory(id: number, dto: UpdateSubCategoryDto, userId: number) {
        const name = dto.name.trim();
        if (!name) throw new BadRequestException('Sub Category name cannot be empty');

        const subCategory = await this.repository.findSubCategoryById(id);
        if (!subCategory || subCategory.user_id !== userId) throw new NotFoundException('Sub Category not found or does not belong to you');

        let targetCategoryId = subCategory.category_id;
        
        if (dto.category_id && dto.category_id !== subCategory.category_id) {
            const newParent = await this.repository.findCategoryById(dto.category_id);
            if (!newParent || newParent.user_id !== userId || newParent.status === MasterStatus.INACTIVE) {
                throw new BadRequestException('Selected parent category is invalid or inactive');
            }
            targetCategoryId = dto.category_id;
        }

        const existing = await this.repository.findSubCategoryByName(name, targetCategoryId, userId);
        if (existing && existing.id !== id) {
            throw new ConflictException('Sub Category with this name already exists in this category');
        }

        return this.repository.updateSubCategoryContent(id, name, dto.category_id);
    }
}
