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
            data,
        });
    }

    async findCategoryByName(name: string, userId: number) {
        return this.prisma.category.findUnique({
            where: {
                name_user_id: {
                    name,
                    user_id: userId,
                },
            },
        });
    }

    async findSubCategoryByName(name: string, categoryId: number, userId: number) {
        return this.prisma.subCategory.findUnique({
            where: {
                name_category_id_user_id: {
                    name,
                    category_id: categoryId,
                    user_id: userId,
                },
            },
        });
    }

    async findCategoryById(id: number) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    async findSubCategoryById(id: number) {
        return this.prisma.subCategory.findUnique({
            where: { id },
        });
    }

    async getCategoriesForDropdown(userId: number) {
        return this.prisma.category.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                name: true,
                status: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    async getCategoryWithSubCategories(userId: number) {
        return this.prisma.category.findMany({
            where: { user_id: userId },
            include: {
                sub_categories: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                    orderBy: { name: 'asc' },
                },
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
}
