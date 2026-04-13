import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { QuerySupportWeeklyReportsDto } from '../dto/query-support-weekly-reports.dto';
import {
  UpsertSupportWeeklyCategoryItemDto,
  UpsertSupportWeeklyOtherTaskItemDto,
  UpsertSupportWeeklyProjectItemDto,
} from '../dto/upsert-support-weekly-report.dto';

const supportWeeklyReportInclude = {
  user: true,
  department: true,
  projectItems: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  otherTaskItems: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  categoryItems: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.SupportWeeklyReportInclude;

export type SupportWeeklyReportWithRelations = Prisma.SupportWeeklyReportGetPayload<{
  include: typeof supportWeeklyReportInclude;
}>;

type ReplaceItemsInput = {
  reportId: string;
  projectItems: UpsertSupportWeeklyProjectItemDto[];
  otherTaskItems: UpsertSupportWeeklyOtherTaskItemDto[];
  categoryItems: UpsertSupportWeeklyCategoryItemDto[];
};

type UpsertReportInput = {
  userId: string;
  departmentId: string;
  weekStart: Date;
  weekEnd: Date;
};

@Injectable()
export class SupportWeeklyReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOne(filters: QuerySupportWeeklyReportsDto): Promise<SupportWeeklyReportWithRelations | null> {
    return this.prisma.supportWeeklyReport.findFirst({
      where: this.buildWhereInput(filters),
      include: supportWeeklyReportInclude,
    });
  }

  findById(id: string): Promise<SupportWeeklyReportWithRelations | null> {
    return this.prisma.supportWeeklyReport.findUnique({
      where: { id },
      include: supportWeeklyReportInclude,
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

  async upsertReport(input: UpsertReportInput): Promise<SupportWeeklyReportWithRelations> {
    return this.prisma.supportWeeklyReport.upsert({
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
      include: supportWeeklyReportInclude,
    });
  }

  async replaceItems(input: ReplaceItemsInput): Promise<SupportWeeklyReportWithRelations> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.supportWeeklyProjectItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.projectItems.length > 0) {
        await transaction.supportWeeklyProjectItem.createMany({
          data: input.projectItems.map((item, index) => ({
            reportId: input.reportId,
            projectName: item.projectName,
            customerName: item.customerName,
            description: item.description,
            statusCode: item.statusCode,
            sortOrder: index,
          })),
        });
      }

      await transaction.supportWeeklyOtherTaskItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.otherTaskItems.length > 0) {
        await transaction.supportWeeklyOtherTaskItem.createMany({
          data: input.otherTaskItems.map((item, index) => ({
            reportId: input.reportId,
            taskName: item.taskName,
            description: item.description,
            sortOrder: index,
          })),
        });
      }

      await transaction.supportWeeklyCategoryItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.categoryItems.length > 0) {
        await transaction.supportWeeklyCategoryItem.createMany({
          data: input.categoryItems.map((item, index) => ({
            reportId: input.reportId,
            categoryName: item.categoryName,
            comment: item.comment,
            durationMinutes: item.durationMinutes,
            sortOrder: index,
          })),
        });
      }

      return transaction.supportWeeklyReport.findUniqueOrThrow({
        where: { id: input.reportId },
        include: supportWeeklyReportInclude,
      });
    });
  }

  updateSubmitted(id: string, submittedAt: Date): Promise<SupportWeeklyReportWithRelations> {
    return this.prisma.supportWeeklyReport.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt,
      },
      include: supportWeeklyReportInclude,
    });
  }

  private buildWhereInput(filters: QuerySupportWeeklyReportsDto): Prisma.SupportWeeklyReportWhereInput {
    const where: Prisma.SupportWeeklyReportWhereInput = {};

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
