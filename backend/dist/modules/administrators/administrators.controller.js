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
exports.AdministratorsController = void 0;
const common_1 = require("@nestjs/common");
const administrators_service_1 = require("./administrators.service");
const create_administrator_dto_1 = require("./dto/create-administrator.dto");
const update_administrator_status_dto_1 = require("./dto/update-administrator-status.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permission_guard_1 = require("../../common/guards/permission.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
let AdministratorsController = class AdministratorsController {
    constructor(administratorsService) {
        this.administratorsService = administratorsService;
    }
    create(createAdministratorDto) {
        return this.administratorsService.create(createAdministratorDto);
    }
    findAll(facilityId) {
        return this.administratorsService.findAll(facilityId);
    }
    findOne(id) {
        return this.administratorsService.findOne(id);
    }
    updateStatus(id, updateAdministratorStatusDto) {
        return this.administratorsService.updateStatus(id, updateAdministratorStatusDto);
    }
};
exports.AdministratorsController = AdministratorsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Administrator' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Administrator created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_add permission.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Username already exists.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_administrator_dto_1.CreateAdministratorDto]),
    __metadata("design:returntype", void 0)
], AdministratorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Administrators' }),
    (0, swagger_1.ApiQuery)({ name: 'facilityId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of administrators.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_view'),
    __param(0, (0, common_1.Query)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdministratorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Administrator by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Administrator details.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Administrator not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdministratorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Administrator status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Administrator not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_edit permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_administrator_status_dto_1.UpdateAdministratorStatusDto]),
    __metadata("design:returntype", void 0)
], AdministratorsController.prototype, "updateStatus", null);
exports.AdministratorsController = AdministratorsController = __decorate([
    (0, swagger_1.ApiTags)('Administrators'),
    (0, common_1.Controller)('administrators'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [administrators_service_1.AdministratorsService])
], AdministratorsController);
//# sourceMappingURL=administrators.controller.js.map