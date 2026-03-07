import { Module } from '@nestjs/common';
import { ProductMasterService } from './product-master.service';
import { ProductMasterController } from './product-master.controller';

@Module({
  providers: [ProductMasterService],
  controllers: [ProductMasterController]
})
export class ProductMasterModule {}
