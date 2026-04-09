import { Department } from '@prisma/client';

import { DepartmentResponseDto } from '../dto/department-response.dto';
import { DepartmentEntity } from '../entities/department.entity';

export class DepartmentMapper {
  static toEntity(department: Department): DepartmentEntity {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
      isActive: department.isActive,
    };
  }

  static toResponse(entity: DepartmentEntity): DepartmentResponseDto {
    return { ...entity };
  }
}

