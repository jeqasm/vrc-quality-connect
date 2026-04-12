import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LicenseTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Array<{ id: string; code: string; name: string }>> {
    return this.prisma.licenseType.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }
}
