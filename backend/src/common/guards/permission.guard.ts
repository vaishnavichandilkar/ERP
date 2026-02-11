import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermission = this.reflector.getAllAndOverride<string>(REQUIRE_PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            console.log('PermissionGuard: No user found in request');
            return false;
        }

        // 1. Admin Bypass
        // 1. Admin Bypass
        if (user.role === 'SUPERADMIN') {
            return true;
        }

        if (user.role === 'ADMIN') {
            // Only allow bypass if status is ACTIVE
            if (user.status === 'ACTIVE') {
                return true;
            }
            // If ADMIN but not ACTIVE, they fall through to permission check.
            // Since they usually don't have explicit permissions assigned (schema doesn't have UserPermission relation used here yet?), they will be blocked.
            // This is desired. PENDING_PROFILE admins can only access endpoints without @RequirePermission (like BusinessProfile).
        }

        // 2. Map Legacy Keys to Module + Action
        const { moduleName, action } = this.mapLegacyPermission(requiredPermission);

        if (!moduleName || !action) {
            console.log(`PermissionGuard: Could not map permission ${requiredPermission}`);
            return false;
        }

        // 3. Check Permissions Map
        // user.permissions = { "Facilities": { canCreate: true, ... } }
        if (user.permissions && user.permissions[moduleName] && user.permissions[moduleName][action]) {
            return true;
        }

        throw new ForbiddenException(`You do not have permission: ${requiredPermission} -> ${moduleName}.${action}`);
    }

    private mapLegacyPermission(perm: string): { moduleName: string, action: string } {
        // Simple mapping
        if (perm === 'manage_access') return { moduleName: 'Access', action: 'canView' }; // Or canUpdate

        // Pattern: [module]_[action]
        // facilityManagement_add -> Facilities.canCreate
        const parts = perm.split('_');
        const legacyModule = parts[0]; // facilityManagement
        const legacyAction = parts[1]; // add, view, edit, delete, export, print

        let moduleName = '';
        if (legacyModule === 'facilityManagement') moduleName = 'Facilities';
        else if (legacyModule === 'userManagement') moduleName = 'Users';
        else if (legacyModule === 'productManagement') moduleName = 'Products';
        else if (legacyModule === 'inventoryManagement') moduleName = 'Inventory';
        else if (legacyModule === 'billing') moduleName = 'Billing';
        else if (legacyModule === 'report') moduleName = 'Reports';
        else return { moduleName: '', action: '' };

        let action = '';
        if (legacyAction === 'add') action = 'canCreate';
        else if (legacyAction === 'view') action = 'canView';
        else if (legacyAction === 'edit') action = 'canUpdate';
        else if (legacyAction === 'delete') action = 'canDelete';
        else if (legacyAction === 'export') action = 'canView'; // Or separate flag? Schema has 4 flags.
        else if (legacyAction === 'print') action = 'canView';

        // Schema only has canView, canCreate, canUpdate, canDelete
        // Export/Print map to View or require specific extension?
        // For now, map to View or ignore.

        return { moduleName, action };
    }
}

