import { Controller, Get, Post, Body, Put, UseInterceptors, UploadedFiles, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import { Step1LanguageDto, Step2MobileDto, Step3VerifyDto, Step4DetailsDto, Step5BusinessDto, Step6ShopDto, Step7BankDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { multerConfig } from '../upload/multer.config';

@ApiTags('Seller Onboarding')
@Controller('onboarding')
export class OnboardingController {
    constructor(private onboardingService: OnboardingService) { }

    @Get('languages')
    @ApiOperation({ summary: 'Get available languages' })
    getLanguages() {
        return this.onboardingService.getLanguages();
    }

    @Post('step1-language')
    @ApiOperation({ summary: 'Step 1: Language Selection' })
    selectLanguage(@Body() dto: Step1LanguageDto) {
        return this.onboardingService.saveLanguage(dto);
    }

    @Post('step2-mobile')
    @ApiOperation({ summary: 'Step 2: Mobile Registration (Send OTP)' })
    registerMobile(@Body() dto: Step2MobileDto) {
        return this.onboardingService.registerMobile(dto);
    }

    @Post('step3-verify')
    @ApiOperation({ summary: 'Step 3: Verify OTP' })
    verifyOtp(@Body() dto: Step3VerifyDto) {
        return this.onboardingService.verifyOtp(dto);
    }

    @Put('step4-details')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Step 4: Basic User Details' })
    updatePersonalDetails(@Request() req, @Body() dto: Step4DetailsDto) {
        return this.onboardingService.updatePersonalDetails(req.user.userId, dto);
    }

    @Post('step5-business')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Step 5: Business Verification (PDF Uploads)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                udyogAadharNumber: { type: 'string' },
                gstNumber: { type: 'string' },
                udyogAadharCertificate: { type: 'string', format: 'binary', description: 'Udyog Aadhar Certificate (PDF)' },
                gstCertificate: { type: 'string', format: 'binary', description: 'GST Certificate (PDF)' },
                businessProof: { type: 'string', format: 'binary', description: 'Proof of Business (Optional PDF)' },
            },
            required: ['udyogAadharNumber', 'gstNumber', 'udyogAadharCertificate', 'gstCertificate']
        },
    })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'udyogAadharCertificate', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 },
        { name: 'businessProof', maxCount: 1 },
    ], multerConfig))
    saveBusinessDetails(
        @Request() req,
        @Body() dto: Step5BusinessDto,
        @UploadedFiles() files: {
            udyogAadharCertificate?: Express.Multer.File[],
            gstCertificate?: Express.Multer.File[],
            businessProof?: Express.Multer.File[]
        }
    ) {
        return this.onboardingService.saveBusinessDetails(req.user.userId, dto, files);
    }

    @Post('step6-shop')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Step 6: Shop Details (PDF Upload)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                shopName: { type: 'string' },
                address: { type: 'string' },
                village: { type: 'string' },
                pinCode: { type: 'string' },
                state: { type: 'string' },
                district: { type: 'string' },
                shopActLicense: { type: 'string', format: 'binary', description: 'Shop Act License (PDF)' },
            },
            required: ['shopName', 'address', 'pinCode', 'state', 'district', 'shopActLicense']
        },
    })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'shopActLicense', maxCount: 1 },
    ], multerConfig))
    saveShopDetails(
        @Request() req,
        @Body() dto: Step6ShopDto,
        @UploadedFiles() files: {
            shopActLicense?: Express.Multer.File[]
        }
    ) {
        return this.onboardingService.saveShopDetails(req.user.userId, dto, files);
    }

    @Post('step7-bank')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Step 7: Bank Details (PDF Uploads)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                holderName: { type: 'string' },
                accountNo: { type: 'string' },
                ifsc: { type: 'string' },
                bankName: { type: 'string' },
                panNumber: { type: 'string' },
                cancelledCheque: { type: 'string', format: 'binary', description: 'Cancelled Cheque (PDF)' },
                panCard: { type: 'string', format: 'binary', description: 'PAN Card (PDF)' },
            },
            required: ['holderName', 'accountNo', 'ifsc', 'bankName', 'panNumber', 'cancelledCheque', 'panCard']
        },
    })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'cancelledCheque', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
    ], multerConfig))
    saveBankDetails(
        @Request() req,
        @Body() dto: Step7BankDto,
        @UploadedFiles() files: {
            cancelledCheque?: Express.Multer.File[],
            panCard?: Express.Multer.File[]
        }
    ) {
        return this.onboardingService.saveBankDetails(req.user.userId, dto, files);
    }

    @Post('step9-complete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Step 9: Final Onboarding Completion' })
    completeOnboarding(@Request() req) {
        return this.onboardingService.completeOnboarding(req.user.userId);
    }
}
