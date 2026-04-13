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

export const supportProjectStatusCodes = [
  'in_progress',
  'in_review',
  'completed',
  'cancelled',
] as const;

export class UpsertSupportWeeklyProjectItemDto {
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
  @IsIn(supportProjectStatusCodes)
  statusCode!: string;
}

export class UpsertSupportWeeklyOtherTaskItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  taskName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpsertSupportWeeklyCategoryItemDto {
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

export class UpsertSupportWeeklyReportDto {
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
  @Type(() => UpsertSupportWeeklyProjectItemDto)
  projectItems!: UpsertSupportWeeklyProjectItemDto[];

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertSupportWeeklyOtherTaskItemDto)
  otherTaskItems!: UpsertSupportWeeklyOtherTaskItemDto[];

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertSupportWeeklyCategoryItemDto)
  categoryItems!: UpsertSupportWeeklyCategoryItemDto[];
}
