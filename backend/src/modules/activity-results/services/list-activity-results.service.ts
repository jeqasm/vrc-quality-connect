import { Injectable } from '@nestjs/common';

import { ActivityResultResponseDto } from '../dto/activity-result-response.dto';
import { ActivityResultMapper } from '../mappers/activity-result.mapper';
import { ActivityResultsRepository } from '../repositories/activity-results.repository';

@Injectable()
export class ListActivityResultsService {
  constructor(private readonly activityResultsRepository: ActivityResultsRepository) {}

  async execute(): Promise<ActivityResultResponseDto[]> {
    const activityResults = await this.activityResultsRepository.findMany();
    return activityResults.map((item) =>
      ActivityResultMapper.toResponse(ActivityResultMapper.toEntity(item)),
    );
  }
}

