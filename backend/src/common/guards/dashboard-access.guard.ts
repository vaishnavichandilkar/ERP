import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class DashboardAccessGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            return false;
        }

        // Only enforce for ADMIN (Business/System)
        // System Admin bypasses because seed sets true.
        // Business Admin starts false.

        if (user.role === 'ADMIN') {
            if (!user.isOtpVerified) {
                throw new ForbiddenException('OTP verification required');
            }
            if (!user.isProfileCompleted) {
                // Allow access to business-details endpoint?
                // This Guard should be applied to Dashboard routes, NOT business details creation.
                // So if we are here, we are accessing a protected dashboard route.
                throw new ForbiddenException('Business profile completion required');
            }
            if (!user.isApprovedBySuperAdmin) {
                throw new ForbiddenException('Account pending Super Admin approval');
            }
        }

        return true;
    }
}
