import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { MasterStatus } from '@prisma/client';

@Injectable()
export class CategoryMasterRepository {
    constructor(private prisma: PrismaService) { }

    async createCategory(data: { name: string; user_id: number; status?: MasterStatus }) {
        return this.prisma.category.create({
            data,
        });
    }

    async createSubCategory(data: { name: string; category_id: number; user_id: number; status?: MasterStatus }) {
        return this.prisma.subCategory.create({
            data: {
                name: data.name,
                user_id: data.user_id,
                category_id: data.category_id,
                status: data.status
            },
        });
    }

    async findCategoryByName(name: string, userId: number) {
        return this.prisma.category.findUnique({
            where: {
                name_user_id: {
                    name,
                    user_id: userId
                }
            },
        });
    }

    async findSubCategoryByName(name: string, categoryId: number, userId: number) {
        return this.prisma.subCategory.findUnique({
            where: {
                name_category_id_user_id: {
                    name,
                    category_id: categoryId,
                    user_id: userId
                }
            },
        });
    }

    async findCategoryById(id: number) {
        return this.prisma.category.findUnique({
            where: { id },
            include: { sub_categories: true }
        });
    }

    async findSubCategoryById(id: number) {
        return this.prisma.subCategory.findUnique({
            where: { id },
            include: { category: true }
        });
    }

    async getCategoriesForDropdown(userId: number, excludeId?: number) {
        // As per instructions, only Categories should be shown in Category dropdowns
        return this.prisma.category.findMany({
            where: {
                user_id: userId,
                status: 'ACTIVE',
                id: { not: excludeId },
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    async getCategoryWithSubCategories(userId: number) {
        return this.prisma.category.findMany({
            where: { user_id: userId },
            include: {
                sub_categories: {
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { name: 'asc' },
        });
    }

    async toggleCategoryStatus(id: number, status: MasterStatus) {
        return this.prisma.category.update({
            where: { id },
            data: { status },
        });
    }

    async toggleSubCategoryStatus(id: number, status: MasterStatus) {
        return this.prisma.subCategory.update({
            where: { id },
            data: { status },
        });
    }

    async updateSubCategoriesStatusByCategory(categoryId: number, status: MasterStatus) {
        return this.prisma.subCategory.updateMany({
            where: { category_id: categoryId },
            data: { status },
        });
    }

    async updateCategoryName(id: number, name: string) {
        return this.prisma.category.update({
            where: { id },
            data: { name },
        });
    }

    async updateCategoryData(id: number, data: { name?: string }) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }

    async updateSubCategoryContent(id: number, name: string, category_id?: number) {
        return this.prisma.subCategory.update({
            where: { id },
            data: {
                name,
                ...(category_id !== undefined && { category_id })
            }
        });
    }

    async promoteSubCategory(subCategoryId: number, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            const subCategory = await tx.subCategory.findUnique({
                where: { id: subCategoryId },
            });

            if (!subCategory || subCategory.user_id !== userId) {
                throw new Error('Sub Category not found or unauthorized');
            }

            // 1. Create the new Category
            const newCategory = await tx.category.create({
                data: {
                    name: subCategory.name,
                    user_id: userId,
                    status: subCategory.status,
                },
            });

            // 2. Update Products to point to the new Category
            // Since sub_category_id is required, we might need a default subcategory OR 
            // just clear it if we make it nullable. But since it's NOT nullable, we'll
            // have to create a "General" subcategory for the new category to move products into.

            const defaultSub = await tx.subCategory.create({
                data: {
                    name: 'General',
                    user_id: userId,
                    category_id: newCategory.id,
                    status: subCategory.status
                }
            });

            await tx.product.updateMany({
                where: { sub_category_id: subCategoryId },
                data: {
                    category_id: newCategory.id,
                    sub_category_id: defaultSub.id
                },
            });

            // 3. Delete the old SubCategory
            await tx.subCategory.delete({
                where: { id: subCategoryId },
            });

            return newCategory;
        });
    }
}
