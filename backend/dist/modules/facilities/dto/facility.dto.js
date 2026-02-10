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
exports.UpdateFacilityStatusDto = exports.UpdateFacilityDto = exports.CreateFacilityDto = exports.FacilityStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FacilityStatus;
(function (FacilityStatus) {
    FacilityStatus["ACTIVE"] = "ACTIVE";
    FacilityStatus["INACTIVE"] = "INACTIVE";
})(FacilityStatus || (exports.FacilityStatus = FacilityStatus = {}));
class CreateFacilityDto {
}
exports.CreateFacilityDto = CreateFacilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Main Warehouse' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123, Storage Lane, NY' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDto.prototype, "totalMachines", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '29ABCDE1234F1Z5', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(15),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "gstNumber", void 0);
class UpdateFacilityDto extends CreateFacilityDto {
}
exports.UpdateFacilityDto = UpdateFacilityDto;
class UpdateFacilityStatusDto {
}
exports.UpdateFacilityStatusDto = UpdateFacilityStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FacilityStatus, example: FacilityStatus.ACTIVE }),
    (0, class_validator_1.IsEnum)(FacilityStatus),
    __metadata("design:type", String)
], UpdateFacilityStatusDto.prototype, "status", void 0);
//# sourceMappingURL=facility.dto.js.map