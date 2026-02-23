import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityStatus, UpdateFacilityStatusDto } from './dto/facility.dto';

@Injectable()
export class FacilitiesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateFacilityDto, sellerId: string) {
        return this.prisma.facility.create({
            data: {
                ...dto,
                sellerId,
                status: 'ACTIVE',
            },
        });
    }

    async findAll(sellerId?: string) {
        return this.prisma.facility.findMany({
            where: {
                isDeleted: false,
                ...(sellerId ? { sellerId } : {})
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, sellerId?: string) {
        const facility = await this.prisma.facility.findFirst({
            where: {
                id,
                isDeleted: false,
                ...(sellerId ? { sellerId } : {})
            },
        });
        if (!facility) throw new NotFoundException('Facility not found or access denied');
        return facility;
    }

    async update(id: string, dto: UpdateFacilityDto, sellerId?: string) {
        await this.findOne(id, sellerId); // Ensure exists and belongs to seller
        return this.prisma.facility.update({
            where: { id },
            data: dto,
        });
    }

    async updateStatus(id: string, dto: UpdateFacilityStatusDto, sellerId?: string) {
        await this.findOne(id, sellerId);
        return this.prisma.facility.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async remove(id: string, sellerId?: string) {
        await this.findOne(id, sellerId);
        // Soft delete
        return this.prisma.facility.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
