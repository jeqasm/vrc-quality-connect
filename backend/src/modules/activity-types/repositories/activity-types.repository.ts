import { Injectable } from '@nestjs/common';
import { ActivityType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ActivityTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<ActivityType[]> {
    return this.prisma.activityType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
