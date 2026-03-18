import { Module } from '@nestjs/common';
import { CategoryMasterService } from './services/category-master.service';
import { CategoryMasterController } from './controllers/category-master.controller';
import { CategoryMasterRepository } from './repositories/category-master.repository';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CategoryMasterService, CategoryMasterRepository],
  controllers: [CategoryMasterController],
  exports: [CategoryMasterService]
})
export class CategoryMasterModule { }
