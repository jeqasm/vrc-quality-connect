import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { QueryLicenseRegistryDto } from '../dto/query-license-registry.dto';
import { RefreshLicenseRegistryDto } from '../dto/refresh-license-registry.dto';
import { RefreshLicenseRegistryResponseDto } from '../dto/refresh-license-registry-response.dto';
import { RefreshLicenseRegistryService } from '../services/refresh-license-registry.service';

@Controller('licenses/registry')
export class LicensesRegistryController {
  constructor(private readonly refreshLicenseRegistryService: RefreshLicenseRegistryService) {}

  @Get()
  getSnapshot(
    @Query() dto: QueryLicenseRegistryDto,
  ): Promise<RefreshLicenseRegistryResponseDto> {
    return this.refreshLicenseRegistryService.getSnapshot(dto);
  }

  @Post('refresh')
  refresh(
    @Body() dto: RefreshLicenseRegistryDto,
  ): Promise<RefreshLicenseRegistryResponseDto> {
    return this.refreshLicenseRegistryService.execute(dto);
  }
}
