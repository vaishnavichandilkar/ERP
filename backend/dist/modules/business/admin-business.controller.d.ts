import { BusinessService } from './business.service';
import { CreateBusinessDetailsDto } from './dto/business.dto';
export declare class AdminBusinessController {
    private businessService;
    constructor(businessService: BusinessService);
    createBusinessDetails(req: any, dto: CreateBusinessDetailsDto): Promise<{
        message: string;
    }>;
}
