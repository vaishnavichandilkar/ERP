import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;
}
