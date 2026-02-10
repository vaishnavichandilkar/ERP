"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AuditMiddleware = class AuditMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    use(req, res, next) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        res.on('finish', async () => {
            const { statusCode } = res;
            let userId = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
                    userId = payload.sub;
                }
                catch (e) {
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
            }
            catch (e) {
                console.error('Audit Log Error', e);
            }
        });
        next();
    }
};
exports.AuditMiddleware = AuditMiddleware;
exports.AuditMiddleware = AuditMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditMiddleware);
//# sourceMappingURL=audit.middleware.js.map