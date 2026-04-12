import { IsDateString, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLicenseRegistryRecordDto {
  @IsDateString()
  issueDate!: string;

  @IsString()
  licenseTypeId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsString()
  @MaxLength(255)
  issuedTo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
