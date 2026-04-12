import { UserResponseDto } from '../dto/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UserWithDepartment } from '../repositories/users.repository';

export class UserMapper {
  static toEntity(user: UserWithDepartment): UserEntity {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      accessRole: {
        code: user.accessRole.code,
        name: user.accessRole.name,
      },
      department: {
        id: user.department.id,
        code: user.department.code,
        name: user.department.name,
      },
    };
  }

  static toResponse(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      accessRole: { ...entity.accessRole },
      department: { ...entity.department },
    };
  }
}
