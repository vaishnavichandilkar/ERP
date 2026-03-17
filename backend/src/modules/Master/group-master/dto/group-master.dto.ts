import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MasterStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class CreateGroupDto {
    @ApiProperty({ example: 'Utilities' })
    @IsString()
    @IsNotEmpty()
    group_name: string;

    @ApiProperty({ example: '1_1', required: true })
    @IsNotEmpty()
    parent_id: any;
}

export class UpdateGroupDto {
    @ApiProperty({ example: 'Electricity' })
    @IsString()
    @IsNotEmpty()
    group_name: string;

    @ApiProperty({ example: '1_1', required: true })
    @IsNotEmpty()
    parent_id: any;
}

export class UpdateGroupStatusDto {
    @ApiProperty({ example: 'ACTIVE', enum: MasterStatus })
    @IsEnum(MasterStatus)
    status: MasterStatus;
}
