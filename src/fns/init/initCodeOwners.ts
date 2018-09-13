import {InitConf} from '../../interfaces/InitConf';
import {Git} from '../../lib/Git';
import {LineReadWriter} from '../../lib/LineReadWriter';
import {PromptableConfig} from '../../lib/PromptableConfig';

export function initCodeOwners(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipCodeOwners')) {
    const user = c.promptedGhUser();

    LineReadWriter.createFromFile('.github/CODEOWNERS')
      .ensureRegex(new RegExp(`^\\*\\s+@${user}`), `* @${user}`)
      .save();

    Git.add('.github/CODEOWNERS');
  }
}
