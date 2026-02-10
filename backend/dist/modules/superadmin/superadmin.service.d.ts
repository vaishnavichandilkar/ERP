import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class SuperAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingAdmins(): Promise<({
        businessDetails: {
            id: string;
            adminId: string;
            businessName: string;
            addressLine: string;
            area: string;
            city: string;
            state: string;
            pincode: string;
            proofOfBusiness: string;
            udyogAadhar: string | null;
            gstCertificate: string | null;
            otherDocument: string | null;
            createdAt: Date;
        };
    } & {
        id: string;
        name: string;
        username: string;
        email: string | null;
        mobile: string | null;
        passwordHash: string | null;
        role: string;
        isActive: boolean;
        isOtpVerified: boolean;
        isProfileCompleted: boolean;
        isApprovedBySuperAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approveAdmin(adminId: string): Promise<{
        message: string;
    }>;
}
