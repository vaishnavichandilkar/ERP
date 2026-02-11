import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BusinessService } from './business.service';
import { CreateBusinessDetailsDto } from './dto/business.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { businessDocsStorage, businessDocsFilter, businessDocsLimits } from './business-docs.config';

@ApiTags('Admin Business')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminBusinessController {
    constructor(private businessService: BusinessService) { }

    @Post('business-details')
    @ApiOperation({ summary: 'Create/Update business details with documents' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Business details saved successfully. Pending Super Admin approval.' })
    @ApiResponse({ status: 400, description: 'Validation Error (File type, size, required fields).' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'proofOfBusiness', maxCount: 1 },
        { name: 'udyogAadhar', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 },
        { name: 'otherDocument', maxCount: 1 },
    ], {
        storage: businessDocsStorage,
        fileFilter: businessDocsFilter,
        limits: businessDocsLimits
    }))
    createBusinessDetails(
        @Request() req,
        @Body() dto: CreateBusinessDetailsDto,
        @UploadedFiles() files: {
            proofOfBusiness?: Express.Multer.File[],
            udyogAadhar?: Express.Multer.File[],
            gstCertificate?: Express.Multer.File[],
            otherDocument?: Express.Multer.File[]
        }
    ) {
        if (!files || !files.proofOfBusiness || files.proofOfBusiness.length === 0) {
            throw new BadRequestException('Proof of Business (PDF) is required');
        }

        const fileData = {
            proofOfBusiness: files.proofOfBusiness[0].path,
            udyogAadhar: files.udyogAadhar?.[0]?.path,
            gstCertificate: files.gstCertificate?.[0]?.path,
            otherDocument: files.otherDocument?.[0]?.path,
        };

        return this.businessService.createBusinessDetails(req.user.id, { ...dto, ...fileData });
    }
}
