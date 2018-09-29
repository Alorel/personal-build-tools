export interface LicenseTplBase {
  name: string;

  year: number;
}

export interface GPL3LicenseTpl extends LicenseTplBase {
  ghRepo: string;
}

export type ApacheLicenseTpl = LicenseTplBase;

export interface MITLicenceTpl extends LicenseTplBase {
  email: string;

  url: string;
}
