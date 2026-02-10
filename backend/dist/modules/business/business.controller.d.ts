import { BusinessService } from './business.service';
export declare class BusinessController {
    private businessService;
    constructor(businessService: BusinessService);
    getProfile(): Promise<{
        name: string;
        license: string;
    }>;
}
