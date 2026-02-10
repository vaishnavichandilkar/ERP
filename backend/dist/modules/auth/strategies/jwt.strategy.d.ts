import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        id: any;
        username: any;
        role: any;
        isOtpVerified: any;
        isProfileCompleted: any;
        isApprovedBySuperAdmin: any;
        facilityId: any;
        permissions: any;
    } | {
        id: any;
        username: any;
        role: string;
        facilityId: any;
        permissions: any;
        isOtpVerified?: undefined;
        isProfileCompleted?: undefined;
        isApprovedBySuperAdmin?: undefined;
    }>;
    private formatPermissions;
}
export {};
