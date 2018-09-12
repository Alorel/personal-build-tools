import {xSpawnSyncSafe} from '../../fns/xSpawn';
import {isLicense, LICENSE_VALUES} from '../../inc/License';
import {InitConf} from '../../interfaces/InitConf';
import {LicenseTpl} from '../../interfaces/LicenseTpl';
import {Fixture} from '../Fixture';
import {PromptableConfig} from '../PromptableConfig';

export function initLicense(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipLicense')) {
    if (!isLicense(c.get('license'))) {
      throw new Error('Invalid license');
    }

    new Fixture('init/license')
      .template<LicenseTpl>(
        `${c.getPromptSelect('license', 'What license do you want to use? ', LICENSE_VALUES)}.txt`,
        {
          email: c.getPromptEmail('email', 'What\'s your email? '),
          name: c.getPrompt('name', 'What\'s your name? '),
          url: c.getPrompt('userWebsite', 'What\'s your url? '),
          year: new Date().getFullYear()
        },
        'LICENSE'
      );

    xSpawnSyncSafe('git', ['add', 'LICENSE']);
  }
}
