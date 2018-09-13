import {License} from '../../inc/License';
import {InitConf} from '../../interfaces/InitConf';
import {ApacheLicenseTpl, GPL3LicenseTpl, MITLicenceTpl} from '../../interfaces/LicenseTpl';
import {Fixture} from '../../lib/Fixture';
import {Git} from '../../lib/Git';
import {ObjectWriter, ObjectWriterFormat} from '../../lib/ObjectWriter';
import {PromptableConfig} from '../../lib/PromptableConfig';

export function initLicense(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipLicense')) {
    const tpl: ApacheLicenseTpl | GPL3LicenseTpl | MITLicenceTpl = {
      name: c.promptedName(),
      year: new Date().getFullYear()
    };

    switch (c.promptedLicense()) {
      case License.MIT:
        (<MITLicenceTpl>tpl).email = c.promptedEmail();
        (<MITLicenceTpl>tpl).url = c.promptedUserWebsite();
        break;
      case License.GPL3:
        (<GPL3LicenseTpl>tpl).ghRepo = c.promptedGhRepo();
    }

    new Fixture('init/license')
      .template<typeof tpl>(`${c.promptedLicense()}.txt`, tpl, 'LICENSE');

    new ObjectWriter('package.json', ObjectWriterFormat.JSON)
      .set('license', c.promptedLicense())
      .save();

    Git.add('LICENSE', 'package.json');
  }
}
