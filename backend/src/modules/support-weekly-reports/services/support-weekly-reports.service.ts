import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { SupportWeeklyReportResponseDto } from '../dto/support-weekly-report-response.dto';
import { QuerySupportWeeklyReportsDto } from '../dto/query-support-weekly-reports.dto';
import { UpsertSupportWeeklyReportDto } from '../dto/upsert-support-weekly-report.dto';
import { SupportWeeklyReportsMapper } from '../mappers/support-weekly-reports.mapper';
import { SupportWeeklyReportsRepository } from '../repositories/support-weekly-reports.repository';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

@Injectable()
export class SupportWeeklyReportsService {
  constructor(
    private readonly supportWeeklyReportsRepository: SupportWeeklyReportsRepository,
    private readonly supportWeeklyReportsMapper: SupportWeeklyReportsMapper,
  ) {}

  async findOne(filters: QuerySupportWeeklyReportsDto): Promise<SupportWeeklyReportResponseDto | null> {
    const report = await this.supportWeeklyReportsRepository.findOne(filters);

    if (!report) {
      return null;
    }

    return this.supportWeeklyReportsMapper.toResponse(this.supportWeeklyReportsMapper.toEntity(report));
  }

  async upsert(dto: UpsertSupportWeeklyReportDto): Promise<SupportWeeklyReportResponseDto> {
    this.validateWeekRange(dto.weekStart, dto.weekEnd);

    const [user, departmentCount] = await Promise.all([
      this.supportWeeklyReportsRepository.findUserById(dto.userId),
      this.supportWeeklyReportsRepository.existsDepartment(dto.departmentId),
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

    const existing = await this.supportWeeklyReportsRepository.findOne({
      userId: dto.userId,
      weekStart: dto.weekStart,
    });

    if (existing?.status === 'submitted') {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Submitted weekly report cannot be updated',
      });
    }

    const report = await this.supportWeeklyReportsRepository.upsertReport({
      userId: dto.userId,
      departmentId: dto.departmentId,
      weekStart: new Date(dto.weekStart),
      weekEnd: new Date(dto.weekEnd),
    });

    const updatedReport = await this.supportWeeklyReportsRepository.replaceItems({
      reportId: report.id,
      projectItems: dto.projectItems,
      otherTaskItems: dto.otherTaskItems,
      categoryItems: dto.categoryItems,
    });

    return this.supportWeeklyReportsMapper.toResponse(
      this.supportWeeklyReportsMapper.toEntity(updatedReport),
    );
  }

  async submit(id: string): Promise<SupportWeeklyReportResponseDto> {
    const existing = await this.supportWeeklyReportsRepository.findById(id);

    if (!existing) {
      throw new ApplicationNotFoundError('SupportWeeklyReport', `id=${id}`);
    }

    if (existing.status === 'submitted') {
      return this.supportWeeklyReportsMapper.toResponse(
        this.supportWeeklyReportsMapper.toEntity(existing),
      );
    }

    if (
      existing.projectItems.length === 0 &&
      existing.otherTaskItems.length === 0 &&
      existing.categoryItems.length === 0
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Cannot submit an empty weekly report',
      });
    }

    const submittedReport = await this.supportWeeklyReportsRepository.updateSubmitted(id, new Date());

    return this.supportWeeklyReportsMapper.toResponse(
      this.supportWeeklyReportsMapper.toEntity(submittedReport),
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
        message: 'Support weekly reports must cover a Monday-to-Friday range',
      });
    }
  }
}
