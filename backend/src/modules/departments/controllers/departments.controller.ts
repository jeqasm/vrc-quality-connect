import { Controller, Get } from '@nestjs/common';

import { DepartmentResponseDto } from '../dto/department-response.dto';
import { ListDepartmentsService } from '../services/list-departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly listDepartmentsService: ListDepartmentsService) {}

  @Get()
  findAll(): Promise<DepartmentResponseDto[]> {
    return this.listDepartmentsService.execute();
  }
}

