import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class SuperAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingAdmins(): Promise<({
        businessDetails: {
            id: string;
            createdAt: Date;
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
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string | null;
        mobile: string | null;
        username: string;
        passwordHash: string | null;
        role: string;
        status: import(".prisma/client").$Enums.AdminStatus;
        isActive: boolean;
        isOtpVerified: boolean;
        isProfileCompleted: boolean;
        isApprovedBySuperAdmin: boolean;
        updatedAt: Date;
    })[]>;
    approveAdmin(adminId: string): Promise<{
        message: string;
    }>;
    rejectAdmin(adminId: string): Promise<{
        message: string;
    }>;
}
