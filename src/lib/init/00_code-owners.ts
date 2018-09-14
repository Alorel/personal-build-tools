import {Options} from 'yargs';
import {addGhUser} from '../../commons/identity';
import {InitConf} from '../../interfaces/InitConf';
import {Obj} from '../../interfaces/OptionsObject';
import {Git} from '../Git';
import {LineReadWriter} from '../LineReadWriter';
import {PromptableConfig} from '../PromptableConfig';

export const options: Obj<Options> = {
  'skip-code-owners': {
    default: false,
    describe: 'Skip .github/CODEOWNERS file generation',
    type: 'boolean'
  }
};

addGhUser(options);

export function handle(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipCodeOwners')) {
    const user = c.promptedGhUser();

    LineReadWriter.createFromFile('.github/CODEOWNERS')
      .ensureRegex(new RegExp(`^\\*\\s+@${user}`), `* @${user}`)
      .save();

    Git.add('.github/CODEOWNERS');
  }
}
