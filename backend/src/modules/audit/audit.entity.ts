export class AuditEntity {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    ip?: string;
    userAgent?: string;
    details?: any;
    createdAt: Date;
}
