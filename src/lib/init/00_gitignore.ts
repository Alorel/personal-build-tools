import {Options} from 'yargs';
import {addPkgMgrToOptions} from '../../commons/addPkgMgr';
import {PackageManager} from '../../inc/PackageManager';
import {InitConf} from '../../interfaces/InitConf';
import {Obj} from '../../interfaces/OptionsObject';
import {Git} from '../Git';
import {LineReadWriter} from '../LineReadWriter';
import {PromptableConfig} from '../PromptableConfig';

export const options: Obj<Options> = {
  'skip-gitignore': {
    boolean: true,
    default: false,
    describe: 'Don\'t generate gitignore'
  }
};

addPkgMgrToOptions(options);

export function handle(c: PromptableConfig<InitConf>): void {
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
        c.promptedPkgMgr() === PackageManager.YARN ? 'package-lock.json' : 'yarn.lock'
      )
      .save();

    Git.add('.gitignore');
  }
}
