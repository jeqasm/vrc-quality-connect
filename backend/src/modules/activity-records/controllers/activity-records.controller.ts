import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { ActivityRecordResponseDto } from '../dto/activity-record-response.dto';
import { CreateActivityRecordDto } from '../dto/create-activity-record.dto';
import { QueryActivityRecordsDto } from '../dto/query-activity-records.dto';
import { ActivityRecordsService } from '../services/activity-records.service';

@Controller('activity-records')
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  @Post()
  create(@Body() dto: CreateActivityRecordDto): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.create(dto);
  }

  @Get()
  findMany(@Query() filters: QueryActivityRecordsDto): Promise<ActivityRecordResponseDto[]> {
    return this.activityRecordsService.findMany(filters);
  }

  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.findById(id);
  }
}
