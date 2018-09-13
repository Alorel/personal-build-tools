import {InitConf} from '../../interfaces/InitConf';
import {LineReadWriter} from '../../lib/LineReadWriter';
import {PromptableConfig} from '../../lib/PromptableConfig';
import {xSpawnSyncSafe} from '../xSpawn';

export function initCodeOwners(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipCodeOwners')) {
    const user = c.getPrompt('ghUser', PromptableConfig.GH_USER);

    LineReadWriter.createFromFile('.github/CODEOWNERS')
      .ensureRegex(new RegExp(`^\\*\\s+@${user}`), `* @${user}`)
      .save();

    xSpawnSyncSafe('git', ['add', '.github/CODEOWNERS']);
  }
}
