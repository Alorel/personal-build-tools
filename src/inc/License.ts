import {values} from 'lodash';

export enum License {
  MIT = 'MIT'
}

export function isLicense(v: any): v is License {
  return LICENSE_VALUES.includes(v);
}

export const LICENSE_VALUES: string[] = <string[]>Object.freeze(values(License));
