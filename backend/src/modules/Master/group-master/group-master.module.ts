import { Module } from '@nestjs/common';
import { GroupMasterController } from './controllers/group.controller';
import { GroupMasterService } from './services/group.service';
import { GroupMasterRepository } from './repositories/group.repository';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupMasterController],
  providers: [GroupMasterService, GroupMasterRepository],
  exports: [GroupMasterService],
})
export class GroupMasterModule { }
