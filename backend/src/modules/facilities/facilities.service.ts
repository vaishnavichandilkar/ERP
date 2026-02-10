import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityStatus, UpdateFacilityStatusDto } from './dto/facility.dto';

@Injectable()
export class FacilitiesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateFacilityDto) {
        return this.prisma.facility.create({
            data: {
                ...dto,
                status: 'ACTIVE', // Default
            },
        });
    }

    async findAll() {
        return this.prisma.facility.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const facility = await this.prisma.facility.findFirst({
            where: { id, isDeleted: false },
        });
        if (!facility) throw new NotFoundException('Facility not found');
        return facility;
    }

    async update(id: string, dto: UpdateFacilityDto) {
        await this.findOne(id); // Ensure exists and not deleted
        return this.prisma.facility.update({
            where: { id },
            data: dto,
        });
    }

    async updateStatus(id: string, dto: UpdateFacilityStatusDto) {
        await this.findOne(id);
        return this.prisma.facility.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        // Soft delete
        return this.prisma.facility.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
