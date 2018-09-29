import {Options} from 'yargs';
import {Obj} from '../interfaces/OptionsObject';

export interface HasUmd {
  umd: string;
}

export function addUmd(opts: Obj<Options> = {}): Obj<Options> {
  opts.umd = {
    describe: 'UMD name of the library',
    type: 'string'
  };

  return opts;
}
