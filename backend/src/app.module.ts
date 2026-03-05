import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import envConfig from './config/env.config';

// Modules (Placeholder until implemented)
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccessModule } from './modules/access/access.module';
import { UploadModule } from './modules/upload/upload.module';
import { BusinessModule } from './modules/business/business.module';
import { AuditMiddleware } from './common/middleware/audit.middleware';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { AdministratorsModule } from './modules/administrators/administrators.module';
import { SuperAdminModule } from './modules/superadmin/superadmin.module';

import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { SellerOnboardingModule } from './modules/seller-onboarding/seller-onboarding.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [envConfig],
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        AccessModule,
        UploadModule,
        BusinessModule,
        FacilitiesModule,
        OperatorsModule,
        AdministratorsModule,
        SuperAdminModule,
        OnboardingModule,
        SellerOnboardingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuditMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
