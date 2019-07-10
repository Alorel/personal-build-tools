import {Options} from 'yargs';
import {PACKAGE_MANAGERS} from '../inc/PackageManager';
import {Obj} from '../interfaces/OptionsObject';

const NAME = 'pkg-mgr';

function getDef(): Options {
  return {
    alias: 'pkg',
    choices: PACKAGE_MANAGERS,
    describe: 'Package manager in use'
  };
}

export function addPkgMgrToOptions<T extends Obj<Options>>(opts: T): T {
  (<any>opts)[NAME] = getDef();

  return opts;
}
