import {values} from 'lodash';

export enum License {
  MIT = 'MIT'
}

export function isLicense(v: any): v is License {
  return v === License.MIT;
}

export const LICENSE_VALUES: string[] = <string[]>Object.freeze(values(License));
