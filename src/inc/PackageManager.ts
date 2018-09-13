import {values} from 'lodash';

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn'
}

export const PACKAGE_MANAGERS: string[] = <string[]>Object.freeze(values(PackageManager));
