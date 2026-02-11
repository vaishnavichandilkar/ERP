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
const platform_express_1 = require("@nestjs/platform-express");
const business_service_1 = require("./business.service");
const business_dto_1 = require("./dto/business.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const business_docs_config_1 = require("./business-docs.config");
let AdminBusinessController = class AdminBusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    createBusinessDetails(req, dto, files) {
        var _a, _b, _c, _d, _e, _f;
        if (!files || !files.proofOfBusiness || files.proofOfBusiness.length === 0) {
            throw new common_1.BadRequestException('Proof of Business (PDF) is required');
        }
        const fileData = {
            proofOfBusiness: files.proofOfBusiness[0].path,
            udyogAadhar: (_b = (_a = files.udyogAadhar) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path,
            gstCertificate: (_d = (_c = files.gstCertificate) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path,
            otherDocument: (_f = (_e = files.otherDocument) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path,
        };
        return this.businessService.createBusinessDetails(req.user.id, Object.assign(Object.assign({}, dto), fileData));
    }
};
exports.AdminBusinessController = AdminBusinessController;
__decorate([
    (0, common_1.Post)('business-details'),
    (0, swagger_1.ApiOperation)({ summary: 'Create/Update business details with documents' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Business details saved successfully. Pending Super Admin approval.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation Error (File type, size, required fields).' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'proofOfBusiness', maxCount: 1 },
        { name: 'udyogAadhar', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 },
        { name: 'otherDocument', maxCount: 1 },
    ], {
        storage: business_docs_config_1.businessDocsStorage,
        fileFilter: business_docs_config_1.businessDocsFilter,
        limits: business_docs_config_1.businessDocsLimits
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateBusinessDetailsDto, Object]),
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