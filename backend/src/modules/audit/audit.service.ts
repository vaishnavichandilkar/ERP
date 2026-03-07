import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async createLog(data: {
        userId?: number;
        action: string;
        resource: string;
        ip?: string;
        userAgent?: string;
        details?: any;
    }) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                resource: data.resource,
                ip: data.ip,
                userAgent: data.userAgent,
                details: data.details,
            },
        });
    }
}
