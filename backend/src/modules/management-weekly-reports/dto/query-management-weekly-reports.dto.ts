import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryManagementWeeklyReportsDto {
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
