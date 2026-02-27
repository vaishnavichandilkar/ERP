import { IsString, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdministratorPermissionsDto {
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_add?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_edit?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_delete?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_export?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_print?: boolean;

    @ApiProperty() @IsBoolean() @IsOptional() userManagement_add?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() userManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() userManagement_edit?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() userManagement_delete?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() userManagement_export?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() userManagement_print?: boolean;

    @ApiProperty() @IsBoolean() @IsOptional() productManagement_add?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_edit?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_delete?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_export?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_print?: boolean;

    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_add?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_edit?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_delete?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_export?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_print?: boolean;

    @ApiProperty() @IsBoolean() @IsOptional() billing_add?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_edit?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_delete?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_export?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_print?: boolean;
}

export class CreateAdministratorDto {
    @ApiProperty({ example: 'Facility Admin' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'fac_admin' })
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

    @ApiProperty({ type: AdministratorPermissionsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => AdministratorPermissionsDto)
    permissions?: AdministratorPermissionsDto;
}
