import {mkdirpSync} from 'fs-extra';
import {homedir} from 'os';
import {join} from 'path';

export const CACHE_DIR = join(homedir(), '.cache', 'alobuild');

try {
  mkdirpSync(CACHE_DIR);
} catch {
  //noop
}
