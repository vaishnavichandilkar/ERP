"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const env_config_1 = require("./config/env.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const access_module_1 = require("./modules/access/access.module");
const upload_module_1 = require("./modules/upload/upload.module");
const business_module_1 = require("./modules/business/business.module");
const audit_middleware_1 = require("./common/middleware/audit.middleware");
const facilities_module_1 = require("./modules/facilities/facilities.module");
const operators_module_1 = require("./modules/operators/operators.module");
const administrators_module_1 = require("./modules/administrators/administrators.module");
const superadmin_module_1 = require("./modules/superadmin/superadmin.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(audit_middleware_1.AuditMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [env_config_1.default],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            access_module_1.AccessModule,
            upload_module_1.UploadModule,
            business_module_1.BusinessModule,
            facilities_module_1.FacilitiesModule,
            operators_module_1.OperatorsModule,
            administrators_module_1.AdministratorsModule,
            superadmin_module_1.SuperAdminModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map