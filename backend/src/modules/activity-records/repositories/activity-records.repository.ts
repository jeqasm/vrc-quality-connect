import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreateActivityRecordDto } from '../dto/create-activity-record.dto';
import { QueryActivityRecordsDto } from '../dto/query-activity-records.dto';

const activityRecordInclude = {
  user: true,
  department: true,
  activityType: true,
  activityResult: true,
} satisfies Prisma.ActivityRecordInclude;

export type ActivityRecordWithRelations = Prisma.ActivityRecordGetPayload<{
  include: typeof activityRecordInclude;
}>;

@Injectable()
export class ActivityRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateActivityRecordDto): Promise<ActivityRecordWithRelations> {
    return this.prisma.activityRecord.create({
      data: {
        userId: dto.userId,
        departmentId: dto.departmentId,
        activityTypeId: dto.activityTypeId,
        activityResultId: dto.activityResultId,
        workDate: new Date(dto.workDate),
        durationMinutes: dto.durationMinutes,
        title: dto.title,
        description: dto.description,
        comment: dto.comment,
        externalId: dto.externalId,
        externalUrl: dto.externalUrl,
      },
      include: activityRecordInclude,
    });
  }

  findMany(filters: QueryActivityRecordsDto): Promise<ActivityRecordWithRelations[]> {
    return this.prisma.activityRecord.findMany({
      where: this.buildWhereInput(filters),
      include: activityRecordInclude,
      orderBy: [{ workDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findById(id: string): Promise<ActivityRecordWithRelations | null> {
    return this.prisma.activityRecord.findUnique({
      where: { id },
      include: activityRecordInclude,
    });
  }

  findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  existsDepartment(id: string): Promise<number> {
    return this.prisma.department.count({
      where: { id },
    });
  }

  existsActivityType(id: string): Promise<number> {
    return this.prisma.activityType.count({
      where: { id },
    });
  }

  existsActivityResult(id: string): Promise<number> {
    return this.prisma.activityResult.count({
      where: { id },
    });
  }

  private buildWhereInput(filters: QueryActivityRecordsDto): Prisma.ActivityRecordWhereInput {
    const where: Prisma.ActivityRecordWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.activityTypeId) {
      where.activityTypeId = filters.activityTypeId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.workDate = {};

      if (filters.dateFrom) {
        where.workDate.gte = new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        where.workDate.lte = new Date(filters.dateTo);
      }
    }

    return where;
  }
}
