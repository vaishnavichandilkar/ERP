import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { AdminBusinessController } from './admin-business.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
    controllers: [BusinessController, AdminBusinessController],
    providers: [BusinessService, PrismaService],
})
export class BusinessModule { }
