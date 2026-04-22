import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateRegistrationInviteDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

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
