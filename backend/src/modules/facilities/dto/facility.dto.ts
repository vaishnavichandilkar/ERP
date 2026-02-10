import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FacilityStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class CreateFacilityDto {
    @ApiProperty({ example: 'Main Warehouse' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @ApiProperty({ example: 'New York' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    location: string;

    @ApiProperty({ example: '123, Storage Lane, NY' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(0)
    totalMachines: number;

    @ApiProperty({ example: '29ABCDE1234F1Z5', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(15)
    gstNumber?: string;
}

export class UpdateFacilityDto extends CreateFacilityDto { }

export class UpdateFacilityStatusDto {
    @ApiProperty({ enum: FacilityStatus, example: FacilityStatus.ACTIVE })
    @IsEnum(FacilityStatus)
    status: FacilityStatus;
}
