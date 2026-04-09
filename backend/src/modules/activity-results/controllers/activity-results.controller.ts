import { Controller, Get } from '@nestjs/common';

import { ActivityResultResponseDto } from '../dto/activity-result-response.dto';
import { ListActivityResultsService } from '../services/list-activity-results.service';

@Controller('activity-results')
export class ActivityResultsController {
  constructor(private readonly listActivityResultsService: ListActivityResultsService) {}

  @Get()
  findAll(): Promise<ActivityResultResponseDto[]> {
    return this.listActivityResultsService.execute();
  }
}

