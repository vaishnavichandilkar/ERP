import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, UnitQueryDto, UpdateUnitStatusDto } from './dto/unit-master.dto';
import { UnitSource, UnitStatus } from '@prisma/client';

@Injectable()
export class UnitMasterService {
    constructor(private prisma: PrismaService) { }

    async getUnitLibrary(query?: { search?: string; gst_uom?: string }) {
        const where: any = {};
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
        const { search, gst_uom, unit_name, status, page = '1', limit = '10', sortBy = 'created_at', sortOrder = 'desc' } = query;

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

        // Ensure system units cannot be edited
        if (unit.source === UnitSource.SYSTEM) {
            throw new ForbiddenException('System library units cannot be edited');
        }

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

    // deleteUnit removed as per request
}
