import {
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
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityRecordDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  activityTypeId!: string;

  @IsUUID()
  activityResultId!: string;

  @IsDateString()
  workDate!: string;

  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalId?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  externalUrl?: string;
}
