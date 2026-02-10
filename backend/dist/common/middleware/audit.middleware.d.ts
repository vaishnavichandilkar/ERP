import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class AuditMiddleware implements NestMiddleware {
    private prisma;
    constructor(prisma: PrismaService);
    use(req: Request, res: Response, next: NextFunction): void;
}
