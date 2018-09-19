import {SpawnSyncOptions, SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns} from 'child_process';
import {sync as xSpawn} from 'cross-spawn';
import {merge} from 'lodash';
import {ext} from '../const/ext';
import {getBin} from './getBin';

export function execLocal(path: string,
                          args: string[] = [],
                          opts?: SpawnSyncOptions): SpawnSyncReturns<string> {
  args = [path].concat(args);
  if (ext === 'ts') {
    args = [getBin('ts-node', 'ts-node')].concat(args);
  }

  const defaultOpts: SpawnSyncOptionsWithStringEncoding = {
    encoding: 'utf8',
    env: process.env
  };
  const options: SpawnSyncOptionsWithStringEncoding = merge(defaultOpts, opts || {});

  return xSpawn(process.execPath, args, options);
}
