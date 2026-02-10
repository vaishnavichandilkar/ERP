"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtRefreshConfig = exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: { expiresIn: process.env.JWT_EXPIRATION || '15m' },
};
exports.jwtRefreshConfig = {
    secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' },
};
//# sourceMappingURL=jwt.config.js.map