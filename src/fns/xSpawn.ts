import {SpawnSyncOptions, SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns} from 'child_process';
import * as crossSpawn from 'cross-spawn';
import {merge} from 'lodash';
import {SafeResult} from '../interfaces/SafeResult';

export function xSpawnSync(cmd: string, args: string[] = [], opts: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
  const defaultOpts: SpawnSyncOptionsWithStringEncoding = {
    encoding: 'utf8',
    env: process.env,
    windowsHide: true
  };

  return crossSpawn.sync(cmd, args, merge(defaultOpts, opts));
}

export function xSpawnSyncSafe(_cmd: string,
                               _args?: string[],
                               _opts?: SpawnSyncOptions): SafeResult<SpawnSyncReturns<string>> {
  try {
    return {
      ok: true,
      result: xSpawnSync.apply(null, arguments)
    };
  } catch (e) {
    return {
      err: e,
      ok: false
    };
  }
}
