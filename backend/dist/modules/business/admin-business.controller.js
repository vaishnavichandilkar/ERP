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
exports.AdminBusinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const business_service_1 = require("./business.service");
const business_dto_1 = require("./dto/business.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AdminBusinessController = class AdminBusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    createBusinessDetails(req, dto) {
        return this.businessService.createBusinessDetails(req.user.id, dto);
    }
};
exports.AdminBusinessController = AdminBusinessController;
__decorate([
    (0, common_1.Post)('business-details'),
    (0, swagger_1.ApiOperation)({ summary: 'Create/Update business details' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Business details saved successfully. Pending Super Admin approval.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found, OTP not verified, or Profile already completed.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateBusinessDetailsDto]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "createBusinessDetails", null);
exports.AdminBusinessController = AdminBusinessController = __decorate([
    (0, swagger_1.ApiTags)('Admin Business'),
    (0, common_1.Controller)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], AdminBusinessController);
//# sourceMappingURL=admin-business.controller.js.map