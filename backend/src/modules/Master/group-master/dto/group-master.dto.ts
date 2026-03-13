import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MasterStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class CreateSubGroupDto {
    @ApiProperty({ example: 'Light Bill' })
    @IsString()
    @IsNotEmpty()
    sub_group_name: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    group_id: number;
}

export class UpdateSubGroupDto {
    @ApiProperty({ example: 'Electric Bill' })
    @IsString()
    @IsNotEmpty()
    sub_group_name: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    group_id: number;
}

export class UpdateSubGroupStatusDto {
    @ApiProperty({ example: 'ACTIVE', enum: MasterStatus })
    @IsEnum(MasterStatus)
    status: MasterStatus;
}

export class UpdateGroupStatusDto {
    @ApiProperty({ example: 'ACTIVE', enum: MasterStatus })
    @IsEnum(MasterStatus)
    status: MasterStatus;
}
