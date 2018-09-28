import {cloneDeep} from 'lodash';
import {PackageJson} from '../interfaces/PackageJson';

// dev (ts-node) and prod (js) will have a different path

/** @internal */
export const PKG_JSON: PackageJson = cloneDeep((() => {
  try {
    return require('../package.json');
  } catch {
    return require('../../package.json');
  }
})());
