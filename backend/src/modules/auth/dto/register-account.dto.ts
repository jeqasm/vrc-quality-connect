import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  accessRoleCode!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
