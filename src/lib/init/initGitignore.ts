import {xSpawnSyncSafe} from '../../fns/xSpawn';
import {InitConf} from '../../interfaces/InitConf';
import {LineReadWriter} from '../LineReadWriter';
import {PromptableConfig} from '../PromptableConfig';

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
        'git_gpg_keys.asc'
      )
      .save();

    xSpawnSyncSafe('git', ['add', '.gitignore']);
  }
}
