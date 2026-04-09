import { Controller, Get } from '@nestjs/common';

import { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findMany();
  }
}
