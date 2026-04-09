import { Injectable } from '@nestjs/common';
import { ActivityResult } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ActivityResultsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<ActivityResult[]> {
    return this.prisma.activityResult.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
