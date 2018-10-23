import {values} from 'lodash';

export enum BuildTarget {
  DECLARATION = 'declaration',
  CJS = 'cjs',
  ESM5 = 'esm5',
  ESM2015 = 'esm2015',
  FESM5 = 'fesm5',
  FESM2015 = 'fesm2015',
  UMD = 'umd'
}

export function isBuildTarget(v: any): v is BuildTarget {
  return allBuildTargets.includes(v);
}

export const allBuildTargets: string[] = <string[]>Object.freeze(values(BuildTarget));

Object.freeze(BuildTarget);
