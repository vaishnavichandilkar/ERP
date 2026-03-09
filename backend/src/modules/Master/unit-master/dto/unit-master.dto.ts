import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UnitStatus } from '@prisma/client';

export class CreateUnitDto {
    @ApiProperty({ example: 'Kilogram' })
    @IsString()
    @IsNotEmpty()
    unitName: string;

    @ApiProperty({ example: 'KGS' })
    @IsString()
    @IsNotEmpty()
    gstUom: string;

    @ApiProperty({ example: 'Weight measurement', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateUnitDto {
    @ApiProperty({ example: 'Kilogram', required: false })
    @IsString()
    @IsOptional()
    unitName?: string;

    @ApiProperty({ example: 'KGS', required: false })
    @IsString()
    @IsOptional()
    gstUom?: string;

    @ApiProperty({ example: 'Weight measurement', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: UnitStatus, example: UnitStatus.ACTIVE, required: false })
    @IsEnum(UnitStatus)
    @IsOptional()
    status?: UnitStatus;
}

export class UpdateUnitStatusDto {
    @ApiProperty({ enum: UnitStatus, example: UnitStatus.INACTIVE })
    @IsEnum(UnitStatus)
    @IsNotEmpty()
    status: UnitStatus;
}

export class UnitQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ enum: UnitStatus, required: false })
    @IsOptional()
    @IsEnum(UnitStatus)
    status?: UnitStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gstUom?: string;

    @ApiProperty({ required: false, default: '1' })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiProperty({ required: false, default: '10' })
    @IsOptional()
    @IsString()
    limit?: string;

    @ApiProperty({ required: false, default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
