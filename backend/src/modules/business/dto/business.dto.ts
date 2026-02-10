import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDetailsDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    addressLine: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    area: string;

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
    pincode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    proofOfBusiness: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    udyogAadhar?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    gstCertificate?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    otherDocument?: string;
}
