import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, UpdateUnitStatusDto, UnitQueryDto } from './dto/unit-master.dto';

@Injectable()
export class UnitMasterService {
    constructor(private prisma: PrismaService) { }

    async getGstUomList() {
        const list = await this.prisma.gstUqcMaster.findMany({
            select: { uqcCode: true }
        });
        return { data: list };
    }

    async createUnit(dto: CreateUnitDto) {
        // Check if unitName unique
        const existing = await this.prisma.unitMaster.findUnique({
            where: { unitName: dto.unitName }
        });
        if (existing) {
            throw new ConflictException('Unit name must be unique');
        }

        // Check if gstUom exists
        const uqc = await this.prisma.gstUqcMaster.findUnique({
            where: { uqcCode: dto.gstUom }
        });
        if (!uqc) {
            throw new BadRequestException('Invalid GST UOM code');
        }

        return this.prisma.unitMaster.create({
            data: {
                unitName: dto.unitName,
                gstUom: dto.gstUom,
                description: dto.description
            }
        });
    }

    async getUnitsList(query: UnitQueryDto) {
        const { search, status, gstUom, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = {};
        if (search) {
            where.unitName = { contains: search, mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }
        if (gstUom) {
            where.gstUom = gstUom;
        }

        const [items, total] = await Promise.all([
            this.prisma.unitMaster.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: { gstUqc: true }
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

    async getUnitById(id: number) {
        const unit = await this.prisma.unitMaster.findUnique({
            where: { id },
            include: { gstUqc: true }
        });
        if (!unit) {
            throw new NotFoundException(`Unit with ID ${id} not found`);
        }
        return unit;
    }

    async updateUnit(id: number, dto: UpdateUnitDto) {
        const unit = await this.getUnitById(id);

        if (dto.unitName && dto.unitName !== unit.unitName) {
            const existing = await this.prisma.unitMaster.findUnique({
                where: { unitName: dto.unitName }
            });
            if (existing) {
                throw new ConflictException('Unit name must be unique');
            }
        }

        if (dto.gstUom) {
            const uqc = await this.prisma.gstUqcMaster.findUnique({
                where: { uqcCode: dto.gstUom }
            });
            if (!uqc) {
                throw new BadRequestException('Invalid GST UOM code');
            }
        }

        return this.prisma.unitMaster.update({
            where: { id },
            data: dto
        });
    }

    async changeStatus(id: number, dto: UpdateUnitStatusDto) {
        await this.getUnitById(id);
        return this.prisma.unitMaster.update({
            where: { id },
            data: { status: dto.status }
        });
    }

    async deleteUnit(id: number) {
        await this.getUnitById(id);
        return this.prisma.unitMaster.delete({
            where: { id }
        });
    }
}
