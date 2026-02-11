import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    createLog(data: {
        userId?: string;
        action: string;
        resource: string;
        ip?: string;
        userAgent?: string;
        details?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        ip: string | null;
        resource: string;
        userAgent: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
