import { Injectable } from '@nestjs/common';

import { ActivityRecordResponseDto } from '../dto/activity-record-response.dto';
import { ActivityRecordEntity } from '../entities/activity-record.entity';
import { ActivityRecordWithRelations } from '../repositories/activity-records.repository';

@Injectable()
export class ActivityRecordMapper {
  toEntity(record: ActivityRecordWithRelations): ActivityRecordEntity {
    return {
      id: record.id,
      userId: record.userId,
      departmentId: record.departmentId,
      activityTypeId: record.activityTypeId,
      activityResultId: record.activityResultId,
      workDate: record.workDate.toISOString().slice(0, 10),
      durationMinutes: record.durationMinutes,
      title: record.title,
      description: record.description,
      comment: record.comment,
      externalId: record.externalId,
      externalUrl: record.externalUrl,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      user: {
        id: record.user.id,
        fullName: record.user.fullName,
        email: record.user.email,
      },
      department: {
        id: record.department.id,
        code: record.department.code,
        name: record.department.name,
      },
      activityType: {
        id: record.activityType.id,
        code: record.activityType.code,
        name: record.activityType.name,
      },
      activityResult: {
        id: record.activityResult.id,
        code: record.activityResult.code,
        name: record.activityResult.name,
      },
    };
  }

  toResponse(entity: ActivityRecordEntity): ActivityRecordResponseDto {
    return { ...entity };
  }
}
