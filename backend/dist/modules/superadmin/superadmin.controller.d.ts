import { SuperAdminService } from './superadmin.service';
import { ApproveAdminDto } from './dto/superadmin.dto';
export declare class SuperAdminController {
    private superAdminService;
    constructor(superAdminService: SuperAdminService);
    getPendingAdmins(req: any): Promise<({
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
    approveAdmin(req: any, dto: ApproveAdminDto): Promise<{
        message: string;
    }>;
}
