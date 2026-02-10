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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const access_service_1 = require("./access.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permission_guard_1 = require("../../common/guards/permission.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const access_dto_1 = require("./dto/access.dto");
let AccessController = class AccessController {
    constructor(accessService) {
        this.accessService = accessService;
    }
    getAllUsers(facilityId) {
        return this.accessService.getAllUsers(facilityId);
    }
    getUserPermissions(id) {
        return this.accessService.getUserPermissions(id);
    }
    updateUserPermissions(id, dto) {
        return this.accessService.updateUserPermissions(id, dto);
    }
    updateUserStatus(id, dto) {
        return this.accessService.updateUserStatus(id, dto);
    }
};
exports.AccessController = AccessController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List all users' }),
    (0, swagger_1.ApiQuery)({ name: 'facilityId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all users.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires manage_access permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('manage_access'),
    __param(0, (0, common_1.Query)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id/permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, swagger_1.ApiOperation)({ summary: 'View user permissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User permissions details.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires manage_access permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('manage_access'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Patch)('users/:id/permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update user permissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires manage_access permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('manage_access'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, access_dto_1.UpdateUserPermissionsDto]),
    __metadata("design:returntype", void 0)
], AccessController.prototype, "updateUserPermissions", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Activate/Deactivate user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires manage_access permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('manage_access'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, access_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", void 0)
], AccessController.prototype, "updateUserStatus", null);
exports.AccessController = AccessController = __decorate([
    (0, swagger_1.ApiTags)('Access Management'),
    (0, common_1.Controller)('access'),
    __metadata("design:paramtypes", [access_service_1.AccessService])
], AccessController);
//# sourceMappingURL=access.controller.js.map