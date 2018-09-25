import {Options} from 'yargs';
import {addEmail, addGhRepo, addName, addUserWebsite} from '../../commons/identity';
import {License, LICENSE_VALUES} from '../../inc/License';
import {InitConf} from '../../interfaces/InitConf';
import {ApacheLicenseTpl, GPL3LicenseTpl, MITLicenceTpl} from '../../interfaces/LicenseTpl';
import {Obj} from '../../interfaces/OptionsObject';
import {Fixture} from '../Fixture';
import {Git} from '../Git';
import {Log} from '../Log';
import {ObjectWriter, ObjectWriterFormat} from '../ObjectWriter';
import {PromptableConfig} from '../PromptableConfig';

export const options: Obj<Options> = {
  license: {
    choices: LICENSE_VALUES,
    describe: 'License to use',
    type: 'string'
  },
  'skip-license': {
    default: false,
    describe: 'Skip creating a license',
    type: 'boolean'
  }
};

addName(options);
addGhRepo(options);
addEmail(options);
addUserWebsite(options);

export function handle(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipLicense')) {
    Log.info('Setting license');
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
    Log.success('License set');
  } else {
    Log.info('Skipping license');
  }
}
