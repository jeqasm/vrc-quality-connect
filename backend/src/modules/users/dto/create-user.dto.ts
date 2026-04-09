import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  statusId!: string;

  @IsString()
  createdBy!: string;
}
