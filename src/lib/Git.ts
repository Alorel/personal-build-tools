import {LazyGetter} from 'typescript-lazy-get-decorator';
import {xSpawnSyncSafe} from '../fns/xSpawn';

export class Git {
  @LazyGetter()
  public static get originUrl(): string | null {
    const r = xSpawnSyncSafe('git', ['config', '--get', 'remote.origin.url']);

    return (r.ok && r.result.status === 0 && r.result.stdout.trim()) || null;
  }

  public static add(...files: string[]): boolean {
    if (files.length) {
      const r = xSpawnSyncSafe('git', ['add'].concat(files));

      return r.ok && r.result.status === 0;
    }

    return false;
  }
}
