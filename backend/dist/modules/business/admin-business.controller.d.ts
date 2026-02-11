import { BusinessService } from './business.service';
import { CreateBusinessDetailsDto } from './dto/business.dto';
export declare class AdminBusinessController {
    private businessService;
    constructor(businessService: BusinessService);
    createBusinessDetails(req: any, dto: CreateBusinessDetailsDto, files: {
        proofOfBusiness?: Express.Multer.File[];
        udyogAadhar?: Express.Multer.File[];
        gstCertificate?: Express.Multer.File[];
        otherDocument?: Express.Multer.File[];
    }): Promise<{
        message: string;
    }>;
}
