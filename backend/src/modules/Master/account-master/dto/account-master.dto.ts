import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  Matches,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactPrefix, MasterStatus } from '@prisma/client';

export enum GroupNameEnum {
  CREDITORS = 'Sundry Creditors (Vendor)',
  DEBTORS = 'Sundry Debtors (Customer)',
}

export enum BalanceTypeEnum {
  CR = 'Cr',
  DR = 'Dr',
}

export enum RegTypeEnum {
  TRADING = 'Trading',
  SERVICE = 'Service',
  MANUFACTURING = 'Manufacturing',
}

export enum RegUnderEnum {
  MICRO = 'Micro',
  SMALL = 'Small',
  MEDIUM = 'Medium',
}

export class CreateAccountMasterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCustomer?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isVendor?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vendorCode?: string;

  @ApiPropertyOptional({ enum: GroupNameEnum })
  @IsEnum(GroupNameEnum)
  @IsOptional()
  groupName?: GroupNameEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gstNo?: string;

  @ApiProperty({ description: 'Indian PAN Format validation' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN must be a valid Indian PAN format (e.g., ABCDE1234F)',
  })
  panNo: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  creditDays: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  openingBalance: number;

  @ApiProperty({ enum: BalanceTypeEnum })
  @IsEnum(BalanceTypeEnum)
  balanceType: BalanceTypeEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  msmeStatus?: boolean;

  @ApiPropertyOptional()
  @ValidateIf(o => o.msmeStatus === true)
  @IsString()
  @IsNotEmpty()
  msmeRegNo?: string;

  @ApiPropertyOptional({ enum: RegTypeEnum })
  @ValidateIf(o => o.msmeStatus === true)
  @IsEnum(RegTypeEnum)
  @IsNotEmpty()
  regType?: RegTypeEnum;

  @ApiPropertyOptional({ enum: RegUnderEnum })
  @ValidateIf(o => o.msmeStatus === true)
  @IsEnum(RegUnderEnum)
  @IsNotEmpty()
  regUnder?: RegUnderEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC Code format' })
  ifscCode: string;

  @ApiProperty({ enum: ContactPrefix })
  @IsEnum(ContactPrefix)
  @IsNotEmpty()
  prefix: ContactPrefix;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactPersonName: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  emailId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be a 10-digit number' })
  mobileNo: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ enum: MasterStatus })
  @IsEnum(MasterStatus)
  @IsOptional()
  status?: MasterStatus;
}

export class UpdateAccountMasterDto extends PartialType(CreateAccountMasterDto) {}

export class UpdateAccountStatusDto {
  @ApiProperty({ enum: MasterStatus })
  @IsEnum(MasterStatus)
  @IsNotEmpty()
  status: MasterStatus;
}
