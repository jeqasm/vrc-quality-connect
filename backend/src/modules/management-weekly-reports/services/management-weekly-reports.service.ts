import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { ManagementWeeklyReportResponseDto } from '../dto/management-weekly-report-response.dto';
import { QueryManagementWeeklyReportsDto } from '../dto/query-management-weekly-reports.dto';
import { UpsertManagementWeeklyReportDto } from '../dto/upsert-management-weekly-report.dto';
import { ManagementWeeklyReportsMapper } from '../mappers/management-weekly-reports.mapper';
import { ManagementWeeklyReportsRepository } from '../repositories/management-weekly-reports.repository';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

@Injectable()
export class ManagementWeeklyReportsService {
  constructor(
    private readonly managementWeeklyReportsRepository: ManagementWeeklyReportsRepository,
    private readonly managementWeeklyReportsMapper: ManagementWeeklyReportsMapper,
  ) {}

  async findOne(filters: QueryManagementWeeklyReportsDto): Promise<ManagementWeeklyReportResponseDto | null> {
    const report = await this.managementWeeklyReportsRepository.findOne(filters);

    if (!report) {
      return null;
    }

    return this.managementWeeklyReportsMapper.toResponse(this.managementWeeklyReportsMapper.toEntity(report));
  }

  async upsert(dto: UpsertManagementWeeklyReportDto): Promise<ManagementWeeklyReportResponseDto> {
    this.validateWeekRange(dto.weekStart, dto.weekEnd);

    const [user, departmentCount] = await Promise.all([
      this.managementWeeklyReportsRepository.findUserById(dto.userId),
      this.managementWeeklyReportsRepository.existsDepartment(dto.departmentId),
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

    const existing = await this.managementWeeklyReportsRepository.findOne({
      userId: dto.userId,
      weekStart: dto.weekStart,
    });

    if (existing?.status === 'submitted') {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Submitted weekly report cannot be updated',
      });
    }

    const report = await this.managementWeeklyReportsRepository.upsertReport({
      userId: dto.userId,
      departmentId: dto.departmentId,
      weekStart: new Date(dto.weekStart),
      weekEnd: new Date(dto.weekEnd),
    });

    const updatedReport = await this.managementWeeklyReportsRepository.replaceItems({
      reportId: report.id,
      projectItems: dto.projectItems,
      otherTaskItems: dto.otherTaskItems,
      categoryItems: dto.categoryItems,
    });

    return this.managementWeeklyReportsMapper.toResponse(
      this.managementWeeklyReportsMapper.toEntity(updatedReport),
    );
  }

  async submit(id: string): Promise<ManagementWeeklyReportResponseDto> {
    const existing = await this.managementWeeklyReportsRepository.findById(id);

    if (!existing) {
      throw new ApplicationNotFoundError('ManagementWeeklyReport', `id=${id}`);
    }

    if (existing.status === 'submitted') {
      return this.managementWeeklyReportsMapper.toResponse(
        this.managementWeeklyReportsMapper.toEntity(existing),
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

    const submittedReport = await this.managementWeeklyReportsRepository.updateSubmitted(id, new Date());

    return this.managementWeeklyReportsMapper.toResponse(
      this.managementWeeklyReportsMapper.toEntity(submittedReport),
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
        message: 'Management weekly reports must cover a Monday-to-Friday range',
      });
    }
  }
}
