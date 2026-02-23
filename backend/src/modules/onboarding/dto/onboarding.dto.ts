import { IsEmail, IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step1MobileDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 15)
    phone: string;
}

export class Step1VerifyDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class Step2DetailsDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class Step3BusinessDto {
    @ApiProperty({ example: 'UDYOG-12345' })
    @IsString()
    @IsNotEmpty()
    udyogAadharNumber: string;

    @ApiProperty({ example: '22AAAAA0000A1Z5' })
    @IsString()
    @IsNotEmpty()
    gstNumber: string;
}

export class Step4ShopDto {
    @ApiProperty({ example: 'My Awesome Shop' })
    @IsString()
    @IsNotEmpty()
    shopName: string;

    @ApiProperty({ example: '123 Market Street' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 'Rose Village' })
    @IsString()
    @IsOptional()
    village?: string;

    @ApiProperty({ example: '400001' })
    @IsString()
    @IsNotEmpty()
    pinCode: string;

    @ApiProperty({ example: 'Maharashtra' })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ example: 'Mumbai' })
    @IsString()
    @IsNotEmpty()
    district: string;
}

export class Step5BankDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    holderName: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    accountNo: string;

    @ApiProperty({ example: 'SBIN0001234' })
    @IsString()
    @IsNotEmpty()
    ifsc: string;

    @ApiProperty({ example: 'State Bank of India' })
    @IsString()
    @IsNotEmpty()
    bankName: string;

    @ApiProperty({ example: 'ABCDE1234F' })
    @IsString()
    @IsNotEmpty()
    panNumber: string;
}
