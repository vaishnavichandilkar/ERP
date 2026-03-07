import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactPrefix } from '@prisma/client';

export class CreateAccountMasterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorCode: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  msme?: string;

  @ApiProperty({ description: 'Indian PAN Format validation' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN must be a valid Indian PAN format (e.g., ABCDE1234F)',
  })
  pan: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gstNo?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  openingBalance?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  creditDays?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ enum: ContactPrefix })
  @IsEnum(ContactPrefix)
  @IsOptional()
  prefix?: ContactPrefix;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPersonName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  emailId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be a 10-digit number' })
  mobileNo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC Code format' })
  ifscCode?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAccountMasterDto extends PartialType(CreateAccountMasterDto) {}

export class UpdateAccountStatusDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
