import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationNotFoundError } from '../../../common/errors/application-not-found.error';
import { ActivityRecordResponseDto } from '../dto/activity-record-response.dto';
import { CreateActivityRecordDto } from '../dto/create-activity-record.dto';
import { QueryActivityRecordsDto } from '../dto/query-activity-records.dto';
import { ActivityRecordMapper } from '../mappers/activity-record.mapper';
import { ActivityRecordsRepository } from '../repositories/activity-records.repository';

@Injectable()
export class ActivityRecordsService {
  constructor(
    private readonly activityRecordsRepository: ActivityRecordsRepository,
    private readonly activityRecordMapper: ActivityRecordMapper,
  ) {}

  async create(dto: CreateActivityRecordDto): Promise<ActivityRecordResponseDto> {
    const [user, departmentCount, activityTypeCount, activityResultCount] =
      await Promise.all([
        this.activityRecordsRepository.findUserById(dto.userId),
        this.activityRecordsRepository.existsDepartment(dto.departmentId),
        this.activityRecordsRepository.existsActivityType(dto.activityTypeId),
        this.activityRecordsRepository.existsActivityResult(dto.activityResultId),
      ]);

    if (!user) {
      throw new ApplicationNotFoundError('User', `id=${dto.userId}`);
    }

    if (departmentCount === 0) {
      throw new ApplicationNotFoundError('Department', `id=${dto.departmentId}`);
    }

    if (activityTypeCount === 0) {
      throw new ApplicationNotFoundError('ActivityType', `id=${dto.activityTypeId}`);
    }

    if (activityResultCount === 0) {
      throw new ApplicationNotFoundError('ActivityResult', `id=${dto.activityResultId}`);
    }

    if (user.departmentId !== dto.departmentId) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Selected department does not match the user department',
      });
    }

    const record = await this.activityRecordsRepository.create(dto);
    return this.activityRecordMapper.toResponse(this.activityRecordMapper.toEntity(record));
  }

  async findMany(filters: QueryActivityRecordsDto): Promise<ActivityRecordResponseDto[]> {
    const records = await this.activityRecordsRepository.findMany(filters);
    return records.map((record) =>
      this.activityRecordMapper.toResponse(this.activityRecordMapper.toEntity(record)),
    );
  }

  async findById(id: string): Promise<ActivityRecordResponseDto> {
    const record = await this.activityRecordsRepository.findById(id);

    if (!record) {
      throw new ApplicationNotFoundError('ActivityRecord', `id=${id}`);
    }

    return this.activityRecordMapper.toResponse(this.activityRecordMapper.toEntity(record));
  }
}
