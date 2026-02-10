import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateNested, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UserRole {
    ADMIN = 'ADMIN',
    ADMINISTRATOR = 'ADMINISTRATOR',
    OPERATOR = 'OPERATOR',
}

export class AdministratorAccessDto {
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

export class OperatorAccessDto {
    @ApiProperty() @IsBoolean() @IsOptional() facilityManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() productManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() inventoryManagement_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() billing_view?: boolean;
    @ApiProperty() @IsBoolean() @IsOptional() report_view?: boolean;
}

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'johndoe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    @IsOptional()
    mobile?: string;

    @ApiProperty({ enum: UserRole, example: UserRole.ADMINISTRATOR })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: 'fac-01', required: false })
    @IsString()
    @IsOptional()
    facilityId?: string;

    @ApiProperty({ type: AdministratorAccessDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AdministratorAccessDto)
    administratorAccess?: AdministratorAccessDto;

    @ApiProperty({ type: OperatorAccessDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => OperatorAccessDto)
    operatorAccess?: OperatorAccessDto;
}

