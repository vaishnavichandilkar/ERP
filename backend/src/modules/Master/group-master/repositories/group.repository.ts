import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class GroupMasterRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAllWithSubGroups(userId: number) {
        return this.prisma.accountGroup.findMany({
            include: {
                sub_groups: {
                    where: { userId },
                    orderBy: {
                        sub_group_name: 'asc',
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    async findHeaderGroupsForDropdown() {
        return this.prisma.accountGroup.findMany({
            select: {
                id: true,
                group_name: true,
            },
            where: {
                status: true,
            },
            orderBy: {
                group_name: 'asc',
            },
        });
    }

    async findGroupById(id: number) {
        return this.prisma.accountGroup.findUnique({
            where: { id },
        });
    }

    async findSubGroupById(id: number, userId: number) {
        return this.prisma.accountSubGroup.findFirst({
            where: { id, userId },
        });
    }

    async createSubGroup(data: { sub_group_name: string; group_id: number; userId: number }) {
        return this.prisma.accountSubGroup.create({
            data,
        });
    }

    async updateSubGroup(id: number, data: { sub_group_name: string; group_id: number }) {
        return this.prisma.accountSubGroup.update({
            where: { id },
            data,
        });
    }

    async updateGroupStatus(id: number, status: boolean) {
        return this.prisma.accountGroup.update({
            where: { id },
            data: { status },
        });
    }

    async updateSubGroupStatus(id: number, status: boolean) {
        return this.prisma.accountSubGroup.update({
            where: { id },
            data: { status },
        });
    }

    async findSubGroupByNameAndGroup(name: string, group_id: number, userId: number) {
        return this.prisma.accountSubGroup.findFirst({
            where: {
                sub_group_name: name,
                group_id,
                userId,
            },
        });
    }
}
