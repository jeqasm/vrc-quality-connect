import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRegistrationInviteDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  departmentId!: string;

  @IsString()
  accessRoleCode!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays!: number;
}
