import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';

        // We can't easily get the user ID here if it's before AuthGuard,
        // but usually middlewares run before guards.
        // However, for auditing authorized actions, we might differ.
        // If we want to log EVERYTHING, we log here.
        // If we want to log USER actions, we might need an interceptor instead.

        // For now, let's log the request basics.
        // If we want to capture the user, we'd need to decode the token manually or use an Interceptor.
        // Given "Audit logging middleware" requirement:

        res.on('finish', async () => {
            const { statusCode } = res;
            // Basic logging
            // To log to DB (AuditLog model created in schema), we can do it here.
            // But extracting User ID is tricky without decoding token again or relying on request attachment which happens later.
            // Let's try to see if req['user'] is available (not likely in middleware unless passport runs before).
            // Passport middleware usually runs as a Guard in NestJS context, which is AFTER middleware.

            // So, if we really want to audit user actions, an INTERCEPTOR is better.
            // But the requirement says "Audit logging middleware". 
            // I will implement it as Middleware for request tracking, but for User tracking an Interceptor is superior.
            // Let's stick to Middleware as requested, but maybe try to parse token if header exists.

            let userId = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                // minimal decode (not verify) to get sub
                try {
                    const token = authHeader.split(' ')[1];
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
                    const parsedId = Number(payload.sub);
                    if (!isNaN(parsedId)) {
                        userId = parsedId;
                    }
                } catch (e) {
                    // ignore
                }
            }

            try {
                await this.prisma.auditLog.create({
                    data: {
                        userId: userId,
                        action: method,
                        resource: originalUrl,
                        ip: ip,
                        userAgent: userAgent,
                        details: { statusCode }
                    }
                });
            } catch (e) {
                console.error('Audit Log Error', e);
            }
        });

        next();
    }
}
