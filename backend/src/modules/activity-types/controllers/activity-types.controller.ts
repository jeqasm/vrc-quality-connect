import { Controller, Get } from '@nestjs/common';

import { ActivityTypeResponseDto } from '../dto/activity-type-response.dto';
import { ListActivityTypesService } from '../services/list-activity-types.service';

@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly listActivityTypesService: ListActivityTypesService) {}

  @Get()
  findAll(): Promise<ActivityTypeResponseDto[]> {
    return this.listActivityTypesService.execute();
  }
}

