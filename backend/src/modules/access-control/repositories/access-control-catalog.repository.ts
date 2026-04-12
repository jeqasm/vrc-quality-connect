import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AccessControlCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPermissions() {
    return this.prisma.accessPermission.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
      },
    });
  }
}
