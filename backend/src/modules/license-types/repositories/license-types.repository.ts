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

  create(input: { code: string; name: string }): Promise<{ id: string; code: string; name: string }> {
    return this.prisma.licenseType.create({
      data: {
        code: input.code,
        name: input.name,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  findById(id: string): Promise<{ id: string; code: string; name: string } | null> {
    return this.prisma.licenseType.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.licenseType.delete({
      where: { id },
    });
  }
}
