import { Module } from '@nestjs/common';
import { GroupMasterService } from './group-master.service';
import { GroupMasterController } from './group-master.controller';

@Module({
  providers: [GroupMasterService],
  controllers: [GroupMasterController]
})
export class GroupMasterModule {}
