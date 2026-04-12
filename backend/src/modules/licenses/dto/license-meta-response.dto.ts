class LicenseTypeOptionDto {
  id!: string;
  code!: string;
  name!: string;
}

export class LicenseMetaResponseDto {
  module!: string;
  implementationStatus!: string;
  licenseTypes!: LicenseTypeOptionDto[];
}
