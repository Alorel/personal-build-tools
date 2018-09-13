import {values} from 'lodash';

export enum License {
  MIT = 'MIT',
  APACHE2 = 'Apache-2.0',
  GPL3 = 'GPL-3.0'
}

export function isLicense(v: any): v is License {
  return LICENSE_VALUES.includes(v);
}

export const LICENSE_VALUES: string[] = <string[]>Object.freeze(values(License));
