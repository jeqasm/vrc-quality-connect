import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSupportRequestDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(5)
  description!: string;

  @IsUUID()
  requesterId!: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsUUID()
  requestTypeId!: string;

  @IsUUID()
  statusId!: string;

  @IsString()
  createdBy!: string;
}

