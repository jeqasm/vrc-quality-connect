import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type UserWithDepartment = Prisma.UserGetPayload<{
  include: {
    department: true;
  };
}>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<UserWithDepartment[]> {
    return this.prisma.user.findMany({
      include: {
        department: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }
}
