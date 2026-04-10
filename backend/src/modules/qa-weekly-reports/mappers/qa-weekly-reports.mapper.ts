import { Injectable } from '@nestjs/common';

import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QaWeeklyReportEntity } from '../entities/qa-weekly-report.entity';
import { QaWeeklyReportWithRelations } from '../repositories/qa-weekly-reports.repository';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class QaWeeklyReportsMapper {
  toEntity(report: QaWeeklyReportWithRelations): QaWeeklyReportEntity {
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
      bugItems: report.bugItems.map((item) => ({
        id: item.id,
        bucketCode: item.bucketCode,
        projectName: item.projectName,
        title: item.title,
        externalUrl: item.externalUrl,
        severityCode: item.severityCode,
        resultCode: item.resultCode,
        sortOrder: item.sortOrder,
      })),
      otherTaskItems: report.otherTaskItems.map((item) => ({
        id: item.id,
        taskName: item.taskName,
        description: item.description,
        durationMinutes: item.durationMinutes,
        sortOrder: item.sortOrder,
      })),
    };
  }

  toResponse(entity: QaWeeklyReportEntity): QaWeeklyReportResponseDto {
    return { ...entity };
  }
}
