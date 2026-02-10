import { Module } from '@nestjs/common';
import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
    controllers: [SuperAdminController],
    providers: [SuperAdminService, PrismaService],
})
export class SuperAdminModule { }
