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
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayUnique,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactPrefix, MasterStatus } from '@prisma/client';

export enum GroupNameEnum {
  SUPPLIER = 'SUPPLIER',
  CUSTOMER = 'CUSTOMER',
}

export enum RegTypeEnum {
  Trading = 'Trading',
  Manufacturing = 'Manufacturing',
  Service = 'Service',
}

export enum RegUnderEnum {
  Micro = 'Micro',
  Small = 'Small',
  Medium = 'Medium',
}

export class ContactPersonDto {
  @ApiProperty({ enum: ContactPrefix })
  @IsEnum(ContactPrefix)
  @IsNotEmpty()
  prefix: ContactPrefix;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Mobile number must be a valid 10-digit Indian number starting with 6-9' })
  mobile: string;
}

export class LedgerDetailsDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  creditDays?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  openingBalance?: number;
}

export class MsmeDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/, { message: 'MSME ID must follow the pattern UDYAM-XX-12-1234567' })
  msmeId: string;

  @ApiProperty({ enum: RegUnderEnum })
  @IsEnum(RegUnderEnum)
  @IsNotEmpty()
  regUnder: RegUnderEnum;

  @ApiProperty({ enum: RegTypeEnum })
  @IsEnum(RegTypeEnum)
  @IsNotEmpty()
  regType: RegTypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certificateUrl?: string;
}

export class CreateAccountMasterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ type: [String], enum: GroupNameEnum })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(GroupNameEnum, { each: true })
  @IsNotEmpty()
  groupName: GroupNameEnum[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Invalid GST format' })
  gstNo?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'PAN must be a valid Indian PAN format (e.g., ABCDE1234F)' })
  panNo: string;

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
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subDistrict?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactPersonDto)
  @IsNotEmpty()
  contactPerson: ContactPersonDto;

  @ApiPropertyOptional()
  @ValidateIf(o => o.groupName?.includes(GroupNameEnum.SUPPLIER))
  @ValidateNested()
  @Type(() => LedgerDetailsDto)
  @IsOptional()
  supplier?: LedgerDetailsDto;

  @ApiPropertyOptional()
  @ValidateIf(o => o.groupName?.includes(GroupNameEnum.CUSTOMER))
  @ValidateNested()
  @Type(() => LedgerDetailsDto)
  @IsOptional()
  customer?: LedgerDetailsDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  msmeEnabled?: boolean;

  @ApiPropertyOptional()
  @ValidateIf(o => o.msmeEnabled === true)
  @ValidateNested()
  @Type(() => MsmeDetailsDto)
  @IsNotEmpty()
  msmeDetails?: MsmeDetailsDto;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  otherDocuments?: string[];

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
