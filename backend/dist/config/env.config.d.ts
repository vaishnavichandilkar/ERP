declare const _default: () => {
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiration: string;
        refreshSecret: string;
        refreshExpiration: string;
    };
    swagger: {
        path: string;
        user: string;
        password: string;
    };
};
export default _default;
