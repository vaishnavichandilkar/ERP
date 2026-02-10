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
exports.OperatorsController = void 0;
const common_1 = require("@nestjs/common");
const operators_service_1 = require("./operators.service");
const create_operator_dto_1 = require("./dto/create-operator.dto");
const update_operator_status_dto_1 = require("./dto/update-operator-status.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permission_guard_1 = require("../../common/guards/permission.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
let OperatorsController = class OperatorsController {
    constructor(operatorsService) {
        this.operatorsService = operatorsService;
    }
    create(createOperatorDto) {
        return this.operatorsService.create(createOperatorDto);
    }
    findAll(facilityId) {
        return this.operatorsService.findAll(facilityId);
    }
    findOne(id) {
        return this.operatorsService.findOne(id);
    }
    updateStatus(id, updateOperatorStatusDto) {
        return this.operatorsService.updateStatus(id, updateOperatorStatusDto);
    }
};
exports.OperatorsController = OperatorsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Operator' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Operator created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_add permission.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Username already exists.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_operator_dto_1.CreateOperatorDto]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Operators' }),
    (0, swagger_1.ApiQuery)({ name: 'facilityId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of operators.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_view'),
    __param(0, (0, common_1.Query)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Operator by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operator details.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Operator not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Operator status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Operator not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires userManagement_edit permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('userManagement_edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_operator_status_dto_1.UpdateOperatorStatusDto]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "updateStatus", null);
exports.OperatorsController = OperatorsController = __decorate([
    (0, swagger_1.ApiTags)('Operators'),
    (0, common_1.Controller)('operators'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [operators_service_1.OperatorsService])
], OperatorsController);
//# sourceMappingURL=operators.controller.js.map