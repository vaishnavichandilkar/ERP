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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let PermissionGuard = class PermissionGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermission = this.reflector.getAllAndOverride(require_permission_decorator_1.REQUIRE_PERMISSION_KEY, [
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
        if (user.role === 'SUPERADMIN') {
            return true;
        }
        if (user.role === 'ADMIN') {
            if (user.status === 'ACTIVE') {
                return true;
            }
        }
        const { moduleName, action } = this.mapLegacyPermission(requiredPermission);
        if (!moduleName || !action) {
            console.log(`PermissionGuard: Could not map permission ${requiredPermission}`);
            return false;
        }
        if (user.permissions && user.permissions[moduleName] && user.permissions[moduleName][action]) {
            return true;
        }
        throw new common_1.ForbiddenException(`You do not have permission: ${requiredPermission} -> ${moduleName}.${action}`);
    }
    mapLegacyPermission(perm) {
        if (perm === 'manage_access')
            return { moduleName: 'Access', action: 'canView' };
        const parts = perm.split('_');
        const legacyModule = parts[0];
        const legacyAction = parts[1];
        let moduleName = '';
        if (legacyModule === 'facilityManagement')
            moduleName = 'Facilities';
        else if (legacyModule === 'userManagement')
            moduleName = 'Users';
        else if (legacyModule === 'productManagement')
            moduleName = 'Products';
        else if (legacyModule === 'inventoryManagement')
            moduleName = 'Inventory';
        else if (legacyModule === 'billing')
            moduleName = 'Billing';
        else if (legacyModule === 'report')
            moduleName = 'Reports';
        else
            return { moduleName: '', action: '' };
        let action = '';
        if (legacyAction === 'add')
            action = 'canCreate';
        else if (legacyAction === 'view')
            action = 'canView';
        else if (legacyAction === 'edit')
            action = 'canUpdate';
        else if (legacyAction === 'delete')
            action = 'canDelete';
        else if (legacyAction === 'export')
            action = 'canView';
        else if (legacyAction === 'print')
            action = 'canView';
        return { moduleName, action };
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map