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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const superadmin_service_1 = require("./superadmin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const superadmin_dto_1 = require("./dto/superadmin.dto");
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    async getPendingAdmins(req) {
        if (req.user.role !== 'SUPER_ADMIN')
            throw new common_1.ForbiddenException('Only Super Admin can access this resource');
        return this.superAdminService.getPendingAdmins();
    }
    async approveAdmin(req, dto) {
        if (req.user.role !== 'SUPER_ADMIN')
            throw new common_1.ForbiddenException('Only Super Admin can access this resource');
        if (!dto.adminId)
            throw new common_1.ForbiddenException('adminId is required');
        return this.superAdminService.approveAdmin(dto.adminId);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('pending-admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of pending admin approvals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of pending admins.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Only Super Admin can access.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getPendingAdmins", null);
__decorate([
    (0, common_1.Post)('approve-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin approved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Only Super Admin can access.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, superadmin_dto_1.ApproveAdminDto]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "approveAdmin", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin'),
    (0, common_1.Controller)('superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [superadmin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=superadmin.controller.js.map