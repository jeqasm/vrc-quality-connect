import { Injectable } from '@nestjs/common';

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
}
