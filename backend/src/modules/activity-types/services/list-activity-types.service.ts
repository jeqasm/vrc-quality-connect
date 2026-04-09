import { Injectable } from '@nestjs/common';

import { ActivityTypeResponseDto } from '../dto/activity-type-response.dto';
import { ActivityTypeMapper } from '../mappers/activity-type.mapper';
import { ActivityTypesRepository } from '../repositories/activity-types.repository';

@Injectable()
export class ListActivityTypesService {
  constructor(private readonly activityTypesRepository: ActivityTypesRepository) {}

  async execute(): Promise<ActivityTypeResponseDto[]> {
    const activityTypes = await this.activityTypesRepository.findMany();
    return activityTypes.map((item) => ActivityTypeMapper.toResponse(ActivityTypeMapper.toEntity(item)));
  }
}

