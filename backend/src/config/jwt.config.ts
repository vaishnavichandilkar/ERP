export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: { expiresIn: process.env.JWT_EXPIRATION || '15m' },
};

export const jwtRefreshConfig = {
    secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' },
};
