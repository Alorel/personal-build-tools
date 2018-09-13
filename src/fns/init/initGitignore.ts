import {PackageManager} from '../../inc/PackageManager';
import {InitConf} from '../../interfaces/InitConf';
import {LineReadWriter} from '../../lib/LineReadWriter';
import {PromptableConfig} from '../../lib/PromptableConfig';
import {xSpawnSyncSafe} from '../xSpawn';

export function initGitignore(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipGitignore')) {
    LineReadWriter.createFromFile('.gitignore')
      .ensure(
        '.idea/',
        'node_modules/',
        'dist/',
        'coverage/',
        '.nyc_output/',
        'yarn-error.log',
        '*.tgz',
        'git_gpg_keys.asc',
        c.get('pkgMgr') === PackageManager.YARN ? 'package-lock.json' : 'yarn.lock'
      )
      .save();

    xSpawnSyncSafe('git', ['add', '.gitignore']);
  }
}
