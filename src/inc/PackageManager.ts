import {values} from 'lodash';

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn'
}

export function isPkgManager(v: any): v is PackageManager {
  return PACKAGE_MANAGERS.includes(v);
}

export const PACKAGE_MANAGERS: string[] = <string[]>Object.freeze(values(PackageManager));
