import { Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { PermissionDeniedError } from '../../../common/errors/permission-denied.error';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findMany(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findMany();
    return users.map((user) => UserMapper.toResponse(UserMapper.toEntity(user)));
  }

  async deleteById(userId: string, currentUserId: string): Promise<void> {
    if (userId === currentUserId) {
      throw new PermissionDeniedError('Current account cannot delete itself');
    }

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ApplicationNotFoundError('User', `id=${userId}`);
    }

    await this.usersRepository.deleteById(userId);
  }

  updateFullName(userId: string, fullName: string): Promise<{ id: string; fullName: string }> {
    return this.usersRepository.updateFullName(userId, fullName);
  }
}
