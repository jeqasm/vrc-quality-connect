import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export type RegistrationInviteWithRelations = Prisma.RegistrationInviteGetPayload<{
  include: {
    department: true;
    accessRole: true;
  };
}>;

@Injectable()
export class RegistrationInvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    tokenHash: string;
    email?: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    accessRoleId: string;
    createdByAccountId: string;
    expiresAt: Date;
  }): Promise<RegistrationInviteWithRelations> {
    return this.prisma.registrationInvite.create({
      data: {
        tokenHash: input.tokenHash,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        departmentId: input.departmentId,
        accessRoleId: input.accessRoleId,
        createdByAccountId: input.createdByAccountId,
        expiresAt: input.expiresAt,
      },
      include: {
        department: true,
        accessRole: true,
      },
    });
  }

  findByTokenHash(tokenHash: string): Promise<RegistrationInviteWithRelations | null> {
    return this.prisma.registrationInvite.findUnique({
      where: { tokenHash },
      include: {
        department: true,
        accessRole: true,
      },
    });
  }

  findManyRecent(): Promise<RegistrationInviteWithRelations[]> {
    return this.prisma.registrationInvite.findMany({
      include: {
        department: true,
        accessRole: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  deleteActiveById(id: string): Promise<{ id: string } | null> {
    return this.prisma.registrationInvite.deleteMany({
      where: {
        id,
        usedAt: null,
      },
    }).then((result) => (result.count > 0 ? { id } : null));
  }
}
