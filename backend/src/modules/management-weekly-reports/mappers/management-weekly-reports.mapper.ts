import { Injectable } from '@nestjs/common';

import { ManagementWeeklyReportResponseDto } from '../dto/management-weekly-report-response.dto';
import { ManagementWeeklyReportEntity } from '../entities/management-weekly-report.entity';
import { ManagementWeeklyReportWithRelations } from '../repositories/management-weekly-reports.repository';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class ManagementWeeklyReportsMapper {
  toEntity(report: ManagementWeeklyReportWithRelations): ManagementWeeklyReportEntity {
    return {
      id: report.id,
      userId: report.userId,
      departmentId: report.departmentId,
      weekStart: toIsoDate(report.weekStart),
      weekEnd: toIsoDate(report.weekEnd),
      status: report.status,
      submittedAt: report.submittedAt?.toISOString() ?? null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      user: {
        id: report.user.id,
        fullName: report.user.fullName,
        email: report.user.email,
      },
      department: {
        id: report.department.id,
        code: report.department.code,
        name: report.department.name,
      },
      projectItems: report.projectItems.map((item) => ({
        id: item.id,
        projectName: item.projectName,
        customerName: item.customerName,
        description: item.description,
        statusCode: item.statusCode,
        sortOrder: item.sortOrder,
      })),
      otherTaskItems: report.otherTaskItems.map((item) => ({
        id: item.id,
        taskName: item.taskName,
        description: item.description,
        sortOrder: item.sortOrder,
      })),
      categoryItems: report.categoryItems.map((item) => ({
        id: item.id,
        categoryName: item.categoryName,
        comment: item.comment,
        durationMinutes: item.durationMinutes,
        sortOrder: item.sortOrder,
      })),
    };
  }

  toResponse(entity: ManagementWeeklyReportEntity): ManagementWeeklyReportResponseDto {
    return { ...entity };
  }
}
