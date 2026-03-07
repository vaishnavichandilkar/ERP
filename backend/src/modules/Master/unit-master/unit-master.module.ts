import { Module } from '@nestjs/common';
import { UnitMasterService } from './unit-master.service';
import { UnitMasterController } from './unit-master.controller';

@Module({
  providers: [UnitMasterService],
  controllers: [UnitMasterController]
})
export class UnitMasterModule {}
