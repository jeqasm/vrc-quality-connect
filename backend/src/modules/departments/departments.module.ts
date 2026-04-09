import { Module } from '@nestjs/common';

import { DepartmentsController } from './controllers/departments.controller';
import { DepartmentsRepository } from './repositories/departments.repository';
import { ListDepartmentsService } from './services/list-departments.service';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsRepository, ListDepartmentsService],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule {}
