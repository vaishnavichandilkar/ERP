import { IsString, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OperatorPermissionsDto {
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() report_view?: boolean;
}

export class CreateOperatorDto {
    @ApiProperty({ example: 'Operator One' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'op_one' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    @IsOptional()
    mobile?: string;

    @ApiProperty({ example: 'uuid-of-facility' })
    @IsString()
    @IsNotEmpty()
    facilityId: string;

    @ApiProperty({ type: OperatorPermissionsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => OperatorPermissionsDto)
    permissions?: OperatorPermissionsDto;
}
