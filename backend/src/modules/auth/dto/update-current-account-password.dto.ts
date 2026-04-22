import { IsString, MinLength } from 'class-validator';

export class UpdateCurrentAccountPasswordDto {
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
