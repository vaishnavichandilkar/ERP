import { Module } from '@nestjs/common';
import { CategoryMasterService } from './category-master.service';
import { CategoryMasterController } from './category-master.controller';

@Module({
  providers: [CategoryMasterService],
  controllers: [CategoryMasterController]
})
export class CategoryMasterModule {}
