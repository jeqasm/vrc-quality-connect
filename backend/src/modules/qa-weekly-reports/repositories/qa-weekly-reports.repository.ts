import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { QueryQaWeeklyReportsDto } from '../dto/query-qa-weekly-reports.dto';
import {
  UpsertQaWeeklyBugItemDto,
  UpsertQaWeeklyOtherTaskItemDto,
} from '../dto/upsert-qa-weekly-report.dto';

const qaWeeklyReportInclude = {
  user: true,
  department: true,
  bugItems: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  otherTaskItems: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.QaWeeklyReportInclude;

export type QaWeeklyReportWithRelations = Prisma.QaWeeklyReportGetPayload<{
  include: typeof qaWeeklyReportInclude;
}>;

type ReplaceItemsInput = {
  reportId: string;
  bugItems: UpsertQaWeeklyBugItemDto[];
  otherTaskItems: UpsertQaWeeklyOtherTaskItemDto[];
};

type UpsertReportInput = {
  userId: string;
  departmentId: string;
  weekStart: Date;
  weekEnd: Date;
};

@Injectable()
export class QaWeeklyReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOne(filters: QueryQaWeeklyReportsDto): Promise<QaWeeklyReportWithRelations | null> {
    return this.prisma.qaWeeklyReport.findFirst({
      where: this.buildWhereInput(filters),
      include: qaWeeklyReportInclude,
    });
  }

  findById(id: string): Promise<QaWeeklyReportWithRelations | null> {
    return this.prisma.qaWeeklyReport.findUnique({
      where: { id },
      include: qaWeeklyReportInclude,
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

  async upsertReport(input: UpsertReportInput): Promise<QaWeeklyReportWithRelations> {
    return this.prisma.qaWeeklyReport.upsert({
      where: {
        userId_weekStart: {
          userId: input.userId,
          weekStart: input.weekStart,
        },
      },
      update: {
        departmentId: input.departmentId,
        weekEnd: input.weekEnd,
      },
      create: {
        userId: input.userId,
        departmentId: input.departmentId,
        weekStart: input.weekStart,
        weekEnd: input.weekEnd,
        status: 'draft',
      },
      include: qaWeeklyReportInclude,
    });
  }

  async replaceItems(input: ReplaceItemsInput): Promise<QaWeeklyReportWithRelations> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.qaWeeklyBugItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.bugItems.length > 0) {
        await transaction.qaWeeklyBugItem.createMany({
          data: input.bugItems.map((item, index) => ({
            reportId: input.reportId,
            bucketCode: item.bucketCode,
            projectName: item.projectName,
            title: item.title,
            externalUrl: item.externalUrl,
            severityCode: item.severityCode,
            resultCode: item.resultCode,
            sortOrder: index,
          })),
        });
      }

      await transaction.qaWeeklyOtherTaskItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.otherTaskItems.length > 0) {
        await transaction.qaWeeklyOtherTaskItem.createMany({
          data: input.otherTaskItems.map((item, index) => ({
            reportId: input.reportId,
            taskName: item.taskName,
            description: item.description,
            durationMinutes: item.durationMinutes,
            sortOrder: index,
          })),
        });
      }

      return transaction.qaWeeklyReport.findUniqueOrThrow({
        where: { id: input.reportId },
        include: qaWeeklyReportInclude,
      });
    });
  }

  updateSubmitted(id: string, submittedAt: Date): Promise<QaWeeklyReportWithRelations> {
    return this.prisma.qaWeeklyReport.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt,
      },
      include: qaWeeklyReportInclude,
    });
  }

  private buildWhereInput(filters: QueryQaWeeklyReportsDto): Prisma.QaWeeklyReportWhereInput {
    const where: Prisma.QaWeeklyReportWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.weekStart) {
      where.weekStart = new Date(filters.weekStart);
    }

    return where;
  }
}
