import {values} from 'lodash';

export enum License {
  MIT = 'MIT',
  APACHE2 = 'Apache-2.0',
  GPL3 = 'GPL-3.0'
}

export const LICENSE_VALUES: string[] = <string[]>Object.freeze(values(License));

export function isLicense(v: any): v is License {
  return !!v && LICENSE_VALUES.indexOf(v) !== -1;
}
