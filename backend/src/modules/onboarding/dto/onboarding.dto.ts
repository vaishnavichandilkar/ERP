import { IsEmail, IsNotEmpty, IsString, IsOptional, Length, IsBoolean, ValidateIf, Matches, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step1LanguageDto {
    @ApiProperty({ example: 'English', description: 'Selected language' })
    @IsString()
    @IsNotEmpty()
    language: string;

    // @ApiProperty({ example: 'uuid-of-existing-onboarding-session', description: 'Optional userId to update existing selection', required: false })
    // @IsString()
    // @IsOptional()
    userId?: number;
}

export class Step2MobileDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 15)
    phone: string;

    @ApiProperty({ example: 'uuid-from-step-1', description: 'The userId returned from Step 1' })
    @IsInt()
    @IsNotEmpty()
    userId: number;
}

export class Step3VerifyDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;

    @ApiProperty({ example: 'uuid-from-step-1', description: 'The userId returned from Step 1' })
    @IsInt()
    @IsNotEmpty()
    userId: number;
}

export class Step4DetailsDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]+$/, { message: 'first name must contain only letters and spaces' })
    first_name: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]+$/, { message: 'last name must contain only letters and spaces' })
    last_name: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class Step5BusinessDto {
    @ApiProperty({ example: 'UDYOG-12345' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{12}$/, { message: 'Udyog Aadhar must be exactly 12 digits long' })
    udyogAadharNumber: string;

    @ApiProperty({ example: '22AAAAA0000A1Z5' })
    @IsString()
    @IsOptional()
    @ValidateIf((o) => o.gstNumber !== '') // Allow passing empty string 
    @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'GST number must be a valid 15 character string format e.g. 22AAAAA0000A1Z5' })
    gstNumber: string;
}

export class Step6ShopDto {
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
    @Matches(/^[a-zA-Z\s]+$/, { message: 'village name must contain only letters and spaces' })
    village?: string;

    @ApiProperty({ example: '400001' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'pincode must be exactly 6 digits' })
    pinCode: string;

    @ApiProperty({ example: 'Maharashtra', required: false })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({ example: 'Pune', required: false })
    @IsString()
    @IsOptional()
    district?: string;
}

export class Step7BankDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]+$/, { message: 'account holder name must contain only letters and spaces' })
    holderName: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+$/, { message: 'account number must contain only numbers' })
    accountNo: string;

    @ApiProperty({ example: 'SBIN0001234' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'IFSC code must be essentially valid e.g. SBIN0001234' })
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
