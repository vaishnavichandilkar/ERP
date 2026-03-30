import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export enum PIStatus {
  GENERATED = 'GENERATED',
  DELETED = 'DELETED',
}

export class CreatePurchaseInvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  rate: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uom: string;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string; // Internal number (auto-gen if missing)

  @ApiProperty({ description: 'The physical invoice number from supplier' })
  @IsString()
  @IsNotEmpty()
  supplierInvoiceNumber: string;

  @ApiProperty({ description: 'The physical invoice date from supplier' })
  @IsDateString()
  @IsNotEmpty()
  supplierInvoiceDate: string;

  @ApiProperty({ required: false, description: 'The date invoice is recorded' })
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  challanNumber?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  creditDays: number;
  
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  poId?: number;

  @ApiProperty({ type: [CreatePurchaseInvoiceItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items: CreatePurchaseInvoiceItemDto[];
}

export class UpdatePurchaseInvoiceItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  rate: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uom: string;
}

export class UpdatePurchaseInvoiceDto {
  @ApiProperty({ enum: PIStatus, required: false })
  @IsOptional()
  @IsEnum(PIStatus)
  status?: PIStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  creditDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplierInvoiceNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  supplierInvoiceDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  challanNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  poId?: number;

  @ApiProperty({ type: [UpdatePurchaseInvoiceItemDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseInvoiceItemDto)
  items?: UpdatePurchaseInvoiceItemDto[];
}
