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
        userId: string | null;
        action: string;
        resource: string;
        ip: string | null;
        userAgent: string | null;
        details: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    }>;
}
