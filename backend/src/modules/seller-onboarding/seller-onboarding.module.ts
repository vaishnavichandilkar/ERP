import { Module } from '@nestjs/common';
import { SellerOnboardingController } from './seller-onboarding.controller';
import { SellerOnboardingService } from './seller-onboarding.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SellerOnboardingController],
    providers: [SellerOnboardingService],
})
export class SellerOnboardingModule { }
