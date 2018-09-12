import {xSpawnSyncSafe} from '../../fns/xSpawn';
import {InitConf} from '../../interfaces/InitConf';
import {LineReadWriter} from '../LineReadWriter';
import {PromptableConfig} from '../PromptableConfig';

export function initCodeOwners(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipCodeOwners')) {
    const user = c.getPrompt('ghUser', 'What\'s your GitHub username? ');

    LineReadWriter.createFromFile('.github/CODEOWNERS')
      .ensureRegex(new RegExp(`^\\*\\s+@${user}`), `* @${user}`)
      .save();

    xSpawnSyncSafe('git', ['add', '.github/CODEOWNERS']);
  }
}
