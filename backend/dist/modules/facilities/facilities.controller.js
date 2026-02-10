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
exports.FacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const facilities_service_1 = require("./facilities.service");
const facility_dto_1 = require("./dto/facility.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permission_guard_1 = require("../../common/guards/permission.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
let FacilitiesController = class FacilitiesController {
    constructor(facilitiesService) {
        this.facilitiesService = facilitiesService;
    }
    create(createFacilityDto) {
        return this.facilitiesService.create(createFacilityDto);
    }
    findAll() {
        return this.facilitiesService.findAll();
    }
    findOne(id) {
        return this.facilitiesService.findOne(id);
    }
    update(id, updateFacilityDto) {
        return this.facilitiesService.update(id, updateFacilityDto);
    }
    updateStatus(id, dto) {
        return this.facilitiesService.updateStatus(id, dto);
    }
    remove(id) {
        return this.facilitiesService.remove(id);
    }
};
exports.FacilitiesController = FacilitiesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create Facility' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Facility created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_add permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facility_dto_1.CreateFacilityDto]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get All Facilities' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of facilities.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'View Facility' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility details.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_view permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Facility' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_edit permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facility_dto_1.UpdateFacilityDto]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate / Deactivate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_edit permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facility_dto_1.UpdateFacilityStatusDto]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Facility (Soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Requires facilityManagement_delete permission.' }),
    (0, require_permission_decorator_1.RequirePermission)('facilityManagement_delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "remove", null);
exports.FacilitiesController = FacilitiesController = __decorate([
    (0, swagger_1.ApiTags)('Facilities'),
    (0, common_1.Controller)('facilities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [facilities_service_1.FacilitiesService])
], FacilitiesController);
//# sourceMappingURL=facilities.controller.js.map