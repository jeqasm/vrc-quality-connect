import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class QuerySupportWeeklyReportsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsDateString()
  weekStart?: string;
}
