import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { QueryManagementWeeklyReportsDto } from '../dto/query-management-weekly-reports.dto';
import {
  UpsertManagementWeeklyCategoryItemDto,
  UpsertManagementWeeklyOtherTaskItemDto,
  UpsertManagementWeeklyProjectItemDto,
} from '../dto/upsert-management-weekly-report.dto';

const managementWeeklyReportInclude = {
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
} satisfies Prisma.ManagementWeeklyReportInclude;

export type ManagementWeeklyReportWithRelations = Prisma.ManagementWeeklyReportGetPayload<{
  include: typeof managementWeeklyReportInclude;
}>;

type ReplaceItemsInput = {
  reportId: string;
  projectItems: UpsertManagementWeeklyProjectItemDto[];
  otherTaskItems: UpsertManagementWeeklyOtherTaskItemDto[];
  categoryItems: UpsertManagementWeeklyCategoryItemDto[];
};

type UpsertReportInput = {
  userId: string;
  departmentId: string;
  weekStart: Date;
  weekEnd: Date;
};

@Injectable()
export class ManagementWeeklyReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOne(filters: QueryManagementWeeklyReportsDto): Promise<ManagementWeeklyReportWithRelations | null> {
    return this.prisma.managementWeeklyReport.findFirst({
      where: this.buildWhereInput(filters),
      include: managementWeeklyReportInclude,
    });
  }

  findById(id: string): Promise<ManagementWeeklyReportWithRelations | null> {
    return this.prisma.managementWeeklyReport.findUnique({
      where: { id },
      include: managementWeeklyReportInclude,
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

  async upsertReport(input: UpsertReportInput): Promise<ManagementWeeklyReportWithRelations> {
    return this.prisma.managementWeeklyReport.upsert({
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
      include: managementWeeklyReportInclude,
    });
  }

  async replaceItems(input: ReplaceItemsInput): Promise<ManagementWeeklyReportWithRelations> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.managementWeeklyProjectItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.projectItems.length > 0) {
        await transaction.managementWeeklyProjectItem.createMany({
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

      await transaction.managementWeeklyOtherTaskItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.otherTaskItems.length > 0) {
        await transaction.managementWeeklyOtherTaskItem.createMany({
          data: input.otherTaskItems.map((item, index) => ({
            reportId: input.reportId,
            taskName: item.taskName,
            description: item.description,
            sortOrder: index,
          })),
        });
      }

      await transaction.managementWeeklyCategoryItem.deleteMany({
        where: { reportId: input.reportId },
      });

      if (input.categoryItems.length > 0) {
        await transaction.managementWeeklyCategoryItem.createMany({
          data: input.categoryItems.map((item, index) => ({
            reportId: input.reportId,
            categoryName: item.categoryName,
            comment: item.comment,
            durationMinutes: item.durationMinutes,
            sortOrder: index,
          })),
        });
      }

      return transaction.managementWeeklyReport.findUniqueOrThrow({
        where: { id: input.reportId },
        include: managementWeeklyReportInclude,
      });
    });
  }

  updateSubmitted(id: string, submittedAt: Date): Promise<ManagementWeeklyReportWithRelations> {
    return this.prisma.managementWeeklyReport.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt,
      },
      include: managementWeeklyReportInclude,
    });
  }

  private buildWhereInput(filters: QueryManagementWeeklyReportsDto): Prisma.ManagementWeeklyReportWhereInput {
    const where: Prisma.ManagementWeeklyReportWhereInput = {};

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
