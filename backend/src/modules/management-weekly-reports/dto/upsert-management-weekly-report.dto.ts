import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const managementProjectStatusCodes = [
  'in_progress',
  'in_review',
  'completed',
  'cancelled',
] as const;

export class UpsertManagementWeeklyProjectItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  projectName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  customerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsIn(managementProjectStatusCodes)
  statusCode!: string;
}

export class UpsertManagementWeeklyOtherTaskItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  taskName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpsertManagementWeeklyCategoryItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  categoryName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsInt()
  @Min(0)
  @Max(2400)
  durationMinutes!: number;
}

export class UpsertManagementWeeklyReportDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  departmentId!: string;

  @IsDateString()
  weekStart!: string;

  @IsDateString()
  weekEnd!: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertManagementWeeklyProjectItemDto)
  projectItems!: UpsertManagementWeeklyProjectItemDto[];

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertManagementWeeklyOtherTaskItemDto)
  otherTaskItems!: UpsertManagementWeeklyOtherTaskItemDto[];

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertManagementWeeklyCategoryItemDto)
  categoryItems!: UpsertManagementWeeklyCategoryItemDto[];
}
