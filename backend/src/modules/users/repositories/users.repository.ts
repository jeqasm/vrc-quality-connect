import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type UserWithDepartment = Prisma.UserGetPayload<{
  include: {
    department: true;
    accessRole: true;
  };
}>;

type AccessRoleProjection = {
  id: string;
  code: string;
  name: string;
};

type DepartmentProjection = {
  id: string;
  code: string;
  name: string;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<UserWithDepartment[]> {
    return this.prisma.user.findMany({
      include: {
        department: true,
        accessRole: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  findAccessRoleByCode(code: string): Promise<AccessRoleProjection | null> {
    return this.prisma.accessRole.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  findDepartmentById(id: string): Promise<DepartmentProjection | null> {
    return this.prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  findById(id: string): Promise<{ id: string; fullName: string; email: string } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
  }

  updateFullName(userId: string, fullName: string): Promise<{ id: string; fullName: string }> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { fullName },
      select: {
        id: true,
        fullName: true,
      },
    });
  }

  async deleteById(userId: string): Promise<void> {
    await this.prisma.$transaction(async (transactionClient) => {
      await transactionClient.activityRecord.deleteMany({
        where: { userId },
      });
      await transactionClient.licenseOperation.deleteMany({
        where: { userId },
      });
      await transactionClient.supportRequest.deleteMany({
        where: { userId },
      });
      await transactionClient.qaWeeklyReport.deleteMany({
        where: { userId },
      });
      await transactionClient.user.delete({
        where: { id: userId },
      });
    });
  }
}
