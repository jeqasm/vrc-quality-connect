import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { QaWeeklyReportResponseDto } from '../dto/qa-weekly-report-response.dto';
import { QueryQaWeeklyReportsDto } from '../dto/query-qa-weekly-reports.dto';
import { UpsertQaWeeklyReportDto } from '../dto/upsert-qa-weekly-report.dto';
import { QaWeeklyReportsMapper } from '../mappers/qa-weekly-reports.mapper';
import { QaWeeklyReportsRepository } from '../repositories/qa-weekly-reports.repository';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

@Injectable()
export class QaWeeklyReportsService {
  constructor(
    private readonly qaWeeklyReportsRepository: QaWeeklyReportsRepository,
    private readonly qaWeeklyReportsMapper: QaWeeklyReportsMapper,
  ) {}

  async findOne(filters: QueryQaWeeklyReportsDto): Promise<QaWeeklyReportResponseDto | null> {
    const report = await this.qaWeeklyReportsRepository.findOne(filters);

    if (!report) {
      return null;
    }

    return this.qaWeeklyReportsMapper.toResponse(this.qaWeeklyReportsMapper.toEntity(report));
  }

  async upsert(dto: UpsertQaWeeklyReportDto): Promise<QaWeeklyReportResponseDto> {
    this.validateWeekRange(dto.weekStart, dto.weekEnd);

    const [user, departmentCount] = await Promise.all([
      this.qaWeeklyReportsRepository.findUserById(dto.userId),
      this.qaWeeklyReportsRepository.existsDepartment(dto.departmentId),
    ]);

    if (!user) {
      throw new ApplicationNotFoundError('User', `id=${dto.userId}`);
    }

    if (departmentCount === 0) {
      throw new ApplicationNotFoundError('Department', `id=${dto.departmentId}`);
    }

    if (user.departmentId !== dto.departmentId) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Selected department does not match the user department',
      });
    }

    const existing = await this.qaWeeklyReportsRepository.findOne({
      userId: dto.userId,
      weekStart: dto.weekStart,
    });

    if (existing?.status === 'submitted') {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Submitted weekly report cannot be updated',
      });
    }

    const report = await this.qaWeeklyReportsRepository.upsertReport({
      userId: dto.userId,
      departmentId: dto.departmentId,
      weekStart: new Date(dto.weekStart),
      weekEnd: new Date(dto.weekEnd),
    });

    const updatedReport = await this.qaWeeklyReportsRepository.replaceItems({
      reportId: report.id,
      bugItems: dto.bugItems,
      otherTaskItems: dto.otherTaskItems,
    });

    return this.qaWeeklyReportsMapper.toResponse(
      this.qaWeeklyReportsMapper.toEntity(updatedReport),
    );
  }

  async submit(id: string): Promise<QaWeeklyReportResponseDto> {
    const existing = await this.qaWeeklyReportsRepository.findById(id);

    if (!existing) {
      throw new ApplicationNotFoundError('QaWeeklyReport', `id=${id}`);
    }

    if (existing.status === 'submitted') {
      return this.qaWeeklyReportsMapper.toResponse(
        this.qaWeeklyReportsMapper.toEntity(existing),
      );
    }

    if (existing.bugItems.length === 0 && existing.otherTaskItems.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Cannot submit an empty weekly report',
      });
    }

    const submittedReport = await this.qaWeeklyReportsRepository.updateSubmitted(id, new Date());

    return this.qaWeeklyReportsMapper.toResponse(
      this.qaWeeklyReportsMapper.toEntity(submittedReport),
    );
  }

  private validateWeekRange(weekStart: string, weekEnd: string): void {
    if (weekStart > weekEnd) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Week start must be earlier than or equal to week end',
      });
    }

    const expectedWeekEnd = addDays(weekStart, 4);

    if (weekEnd !== expectedWeekEnd) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'QA weekly reports must cover a Monday-to-Friday range',
      });
    }
  }
}
