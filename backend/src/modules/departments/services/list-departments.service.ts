import { Injectable } from '@nestjs/common';

import { DepartmentResponseDto } from '../dto/department-response.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { DepartmentsRepository } from '../repositories/departments.repository';

@Injectable()
export class ListDepartmentsService {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  async execute(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentsRepository.findMany();
    return departments.map((item) => DepartmentMapper.toResponse(DepartmentMapper.toEntity(item)));
  }
}

