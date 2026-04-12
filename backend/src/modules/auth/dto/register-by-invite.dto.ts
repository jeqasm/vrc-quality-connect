import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterByInviteDto {
  @IsString()
  inviteToken!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
