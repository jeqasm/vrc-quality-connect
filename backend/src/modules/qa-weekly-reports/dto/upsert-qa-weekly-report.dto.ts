import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertQaWeeklyBugItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  bucketCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  projectName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  externalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  severityCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  resultCode?: string;
}

export class UpsertQaWeeklyOtherTaskItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  taskName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(0)
  @Max(2400)
  durationMinutes!: number;
}

export class UpsertQaWeeklyReportDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  departmentId!: string;

  @IsDateString()
  weekStart!: string;

  @IsDateString()
  weekEnd!: string;

  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => UpsertQaWeeklyBugItemDto)
  bugItems!: UpsertQaWeeklyBugItemDto[];

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => UpsertQaWeeklyOtherTaskItemDto)
  otherTaskItems!: UpsertQaWeeklyOtherTaskItemDto[];
}
