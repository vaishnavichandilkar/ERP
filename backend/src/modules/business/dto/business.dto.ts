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

    @ApiProperty({ type: 'string', format: 'binary', description: 'Proof of Business (PDF)' })
    @IsOptional() // Handled by FileInterceptor
    proofOfBusiness: any;

    @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Udyog Aadhar (PDF)' })
    @IsOptional()
    udyogAadhar?: any;

    @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'GST Certificate (PDF)' })
    @IsOptional()
    gstCertificate?: any;

    @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Other Document (PDF)' })
    @IsOptional()
    otherDocument?: any;
}
