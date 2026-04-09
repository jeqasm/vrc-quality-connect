import { Injectable } from '@nestjs/common';
import { Department } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
