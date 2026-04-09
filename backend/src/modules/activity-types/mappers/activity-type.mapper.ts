import { ActivityType } from '@prisma/client';

import { ActivityTypeResponseDto } from '../dto/activity-type-response.dto';
import { ActivityTypeEntity } from '../entities/activity-type.entity';

export class ActivityTypeMapper {
  static toEntity(activityType: ActivityType): ActivityTypeEntity {
    return {
      id: activityType.id,
      code: activityType.code,
      name: activityType.name,
      isActive: activityType.isActive,
    };
  }

  static toResponse(entity: ActivityTypeEntity): ActivityTypeResponseDto {
    return { ...entity };
  }
}

