import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UnitStatus } from '@prisma/client';

export class CreateUnitDto {
    @ApiProperty({ example: 'Quantity' })
    @IsString()
    @IsNotEmpty()
    unit_name: string;

    @ApiProperty({ example: 'BAG' })
    @IsString()
    @IsNotEmpty()
    gst_uom: string;

    @ApiProperty({ example: 'BAGS' })
    @IsString()
    @IsNotEmpty()
    full_name_of_measurement: string;
}

export class UpdateUnitDto {
    @ApiProperty({ example: 'Quantity', required: false })
    @IsString()
    @IsOptional()
    unit_name?: string;

    @ApiProperty({ example: 'BAG', required: false })
    @IsString()
    @IsOptional()
    gst_uom?: string;

    @ApiProperty({ example: 'BAGS', required: false })
    @IsString()
    @IsOptional()
    full_name_of_measurement?: string;
}

export class UpdateUnitStatusDto {
    @ApiProperty({ enum: UnitStatus, example: UnitStatus.ACTIVE })
    @IsEnum(UnitStatus)
    @IsNotEmpty()
    status: UnitStatus;
}

export class UnitQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gst_uom?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    unit_name?: string;

    @ApiProperty({ enum: UnitStatus, required: false })
    @IsOptional()
    @IsEnum(UnitStatus)
    status?: UnitStatus;

    @ApiProperty({ required: false, default: '1' })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiProperty({ required: false, default: '10' })
    @IsOptional()
    @IsString()
    limit?: string;

    @ApiProperty({ required: false, default: 'created_at' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
