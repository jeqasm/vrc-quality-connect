class LicenseRegistryRecordLicenseTypeResponseDto {
  id!: string;
  code!: string;
  name!: string;
}

export class LicenseRegistryRecordResponseDto {
  id!: string;
  issueDate!: string;
  quantity!: number;
  organizationName!: string | null;
  recipientEmail!: string | null;
  issuedTo!: string;
  comment!: string | null;
  createdAt!: string;
  updatedAt!: string;
  licenseType!: LicenseRegistryRecordLicenseTypeResponseDto;
}
