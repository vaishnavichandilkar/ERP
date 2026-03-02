import { IsEmail, IsNotEmpty, IsString, IsOptional, Length, IsBoolean, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step1LanguageDto {
    @ApiProperty({ example: 'English', description: 'Selected language (English, Hindi, Marathi, Kannada)' })
    @IsString()
    @IsNotEmpty()
    language: string;

    // @ApiProperty({ example: 'uuid-of-existing-onboarding-session', description: 'Optional userId to update existing selection', required: false })
    // @IsString()
    // @IsOptional()
    userId?: string;
}

export class Step2MobileDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 15)
    phone: string;

    @ApiProperty({ example: 'uuid-from-step-1', description: 'The userId returned from Step 1' })
    @IsString()
    @IsNotEmpty()
    userId: string;
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
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class Step4DetailsDto {
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

export class Step5BusinessDto {
    @ApiProperty({ example: 'UDYOG-12345' })
    @IsString()
    @IsNotEmpty()
    udyogAadharNumber: string;

    @ApiProperty({ example: '22AAAAA0000A1Z5' })
    @IsString()
    @IsNotEmpty()
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

export class Step7BankDto {
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

export class Step8MachineDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    isUsingOwnMachine: boolean;

    @ApiProperty({ example: 'Essae' })
    @ValidateIf(o => o.isUsingOwnMachine === true)
    @IsString()
    @IsNotEmpty()
    make: string;

    @ApiProperty({ example: 'Machine 1' })
    @IsString()
    @IsNotEmpty()
    machineName: string;

    @ApiProperty({ example: 'HGDHJ764754675' })
    @ValidateIf(o => o.isUsingOwnMachine === true)
    @IsString()
    @IsNotEmpty()
    modelNumber: string;

    @ApiProperty({ example: 'Digital' })
    @ValidateIf(o => o.isUsingOwnMachine === true)
    @IsString()
    @IsNotEmpty()
    machineType: string;
}
