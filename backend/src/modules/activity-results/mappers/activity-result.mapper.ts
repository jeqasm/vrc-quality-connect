import { ActivityResult } from '@prisma/client';

import { ActivityResultResponseDto } from '../dto/activity-result-response.dto';
import { ActivityResultEntity } from '../entities/activity-result.entity';

export class ActivityResultMapper {
  static toEntity(activityResult: ActivityResult): ActivityResultEntity {
    return {
      id: activityResult.id,
      code: activityResult.code,
      name: activityResult.name,
      isActive: activityResult.isActive,
    };
  }

  static toResponse(entity: ActivityResultEntity): ActivityResultResponseDto {
    return { ...entity };
  }
}

