import { BusinessService } from './business.service';
export declare class BusinessController {
    private businessService;
    constructor(businessService: BusinessService);
    getProfile(): Promise<{
        name: string;
        license: string;
    }>;
    createProfile(dto: any, req: any): Promise<{
        message: string;
    }>;
}
