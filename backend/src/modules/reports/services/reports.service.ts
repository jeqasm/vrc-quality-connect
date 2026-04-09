import { Injectable } from '@nestjs/common';

import { SummaryResponseDto } from '../dto/summary-response.dto';
import { ReportsRepository } from '../repositories/reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

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
