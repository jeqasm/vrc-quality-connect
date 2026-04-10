import { Injectable } from '@nestjs/common';

import { LicenseReportResponseDto } from '../dto/license-report-response.dto';
import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QueryLicenseReportDto } from '../dto/query-license-report.dto';
import { QueryQaWeeklyReportDto } from '../dto/query-qa-weekly-report.dto';
import { SummaryResponseDto } from '../dto/summary-response.dto';
import { ReportsRepository } from '../repositories/reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getLicenseReport(dto: QueryLicenseReportDto): Promise<LicenseReportResponseDto> {
    const [totals, licenseTypes, issueTrend] = await Promise.all([
      this.reportsRepository.aggregateLicenseTotals(dto.dateFrom, dto.dateTo),
      this.reportsRepository.groupLicenseQuantityByType(dto.dateFrom, dto.dateTo),
      this.reportsRepository.groupLicenseQuantityByDate(dto.dateFrom, dto.dateTo),
    ]);

    const totalIssuedLicenses = totals.totalIssuedLicenses;

    return {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      totalIssuedLicenses,
      totalRegistryEntries: totals.totalRegistryEntries,
      licenseTypes: licenseTypes.map((item) => ({
        licenseType: item.licenseType,
        quantity: item.quantity,
        percentage:
          totalIssuedLicenses > 0
            ? Math.round((item.quantity / totalIssuedLicenses) * 1000) / 10
            : 0,
      })),
      issueTrend: issueTrend.map((point) => ({
        issueDate: point.issueDate,
        quantity: point.quantity,
      })),
    };
  }

  async getQaWeeklyReport(dto: QueryQaWeeklyReportDto): Promise<QaWeeklyReportResponseDto> {
    const [totals, retestBugs, newBugs, testedTasks, newTasks, otherTasks] = await Promise.all([
      this.reportsRepository.aggregateQaWeeklyTotals(dto.dateFrom, dto.dateTo),
      this.reportsRepository.listQaWeeklyBugItemsByBucket(dto.dateFrom, dto.dateTo, 'retest'),
      this.reportsRepository.listQaWeeklyBugItemsByBucket(dto.dateFrom, dto.dateTo, 'new_bug'),
      this.reportsRepository.listQaWeeklyBugItemsByBucket(dto.dateFrom, dto.dateTo, 'tested_task'),
      this.reportsRepository.listQaWeeklyBugItemsByBucket(dto.dateFrom, dto.dateTo, 'new_task'),
      this.reportsRepository.listQaWeeklyOtherTaskItems(dto.dateFrom, dto.dateTo),
    ]);

    return {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      totals: {
        closedRetestBugs: totals.closedRetestBugs,
        sentToReworkRetestBugs: totals.sentToReworkRetestBugs,
        totalNewBugs: totals.totalNewBugs,
        totalTestedTasks: totals.totalTestedTasks,
        totalNewTasks: totals.totalNewTasks,
        totalOtherTaskHours: this.toHours(totals.totalOtherTaskMinutes),
      },
      retestBugs,
      newBugs,
      testedTasks,
      newTasks,
      otherTasks,
    };
  }

  async getSummary(): Promise<SummaryResponseDto> {
    const [totals, totalHoursByUser, totalHoursByActivityType] = await Promise.all([
      this.reportsRepository.aggregateTotals(),
      this.reportsRepository.groupHoursByUser(),
      this.reportsRepository.groupHoursByActivityType(),
    ]);

    return {
      totalHours: this.toHours(totals._sum.durationMinutes),
      totalRecordsCount: totals._count._all,
      totalHoursByUser: totalHoursByUser.map((group) => ({
        id: group.userId,
        code: group.user.email,
        name: group.user.fullName,
        email: group.user.email,
        totalHours: this.toHours(group._sum.durationMinutes),
      })),
      totalHoursByActivityType: totalHoursByActivityType.map((group) => ({
        id: group.activityTypeId,
        code: group.activityType.code,
        name: group.activityType.name,
        totalHours: this.toHours(group._sum.durationMinutes),
      })),
    };
  }

  private toHours(durationMinutes: number | null): number {
    const minutes = durationMinutes ?? 0;
    return Math.round((minutes / 60) * 100) / 100;
  }
}
