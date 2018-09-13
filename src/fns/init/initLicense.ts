import {InitConf} from '../../interfaces/InitConf';
import {LicenseTpl} from '../../interfaces/LicenseTpl';
import {Fixture} from '../../lib/Fixture';
import {PromptableConfig} from '../../lib/PromptableConfig';
import {xSpawnSyncSafe} from '../xSpawn';

export function initLicense(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipLicense')) {
    new Fixture('init/license')
      .template<LicenseTpl>(
        `${c.get('license')}.txt`,
        {
          email: c.promptedEmail(),
          name: c.promptedName(),
          url: c.promptedUserWebsite(),
          year: new Date().getFullYear()
        },
        'LICENSE'
      );

    xSpawnSyncSafe('git', ['add', 'LICENSE']);
  }
}
