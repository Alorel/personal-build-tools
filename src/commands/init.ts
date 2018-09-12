import {values} from 'lodash';
import {Argv, CommandModule} from 'yargs';
import {addEmail, addName, addUserWebsite, HasEmail, HasName, HasUserWebsite} from '../commons/identity';
import {addConfig} from '../fns/addConfig';
import {cmdName} from '../fns/cmdName';
import {LicenseTpl} from '../interfaces/LicenseTpl';
import {Fixture} from '../lib/Fixture';
import {PromptableConfig} from '../lib/PromptableConfig';

enum License {
  MIT = 'MIT'
}

function isLicense(v: any): v is License {
  return v === License.MIT;
}

interface Conf extends HasName, HasUserWebsite, HasEmail {
  license: License;

  skipLicense: boolean;
}

const command = cmdName(__filename);

const cmd: CommandModule = {
  builder(argv: Argv) {
    addConfig(argv, 'init');
    addEmail(argv);
    argv.option('license', {
      choices: values(License),
      default: License.MIT,
      describe: 'License to use',
      string: true
    });
    addName(argv);

    argv.option('skip-license', {
      boolean: true,
      default: false,
      describe: 'Skip creating a license'
    });

    addUserWebsite(argv);

    return argv;
  },
  command,
  describe: 'Project initialisation operations',
  handler(conf: Conf) {
    if (!isLicense(conf.license)) {
      throw new Error('Invalid license');
    }
    const c = new PromptableConfig(conf);

    if (!conf.skipLicense) {
      new Fixture('init/license')
        .template<LicenseTpl>(
          `${c.getPromptSelect('license', 'What license do you want to use? ', values(License))}.txt`,
          {
            email: c.getPromptEmail('email', 'What\'s your email? '),
            name: c.getPrompt('name', 'What\'s your name? '),
            url: c.getPrompt('userWebsite', 'What\'s your url? '),
            year: new Date().getFullYear()
          },
          'LICENSE'
        );
    }
  }
};

export = cmd;
