import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class BusinessService {
    private prisma;
    constructor(prisma: PrismaService);
    getBusinessProfile(): Promise<{
        name: string;
        license: string;
    }>;
    createBusinessDetails(userId: string, dto: any): Promise<{
        message: string;
    }>;
}
