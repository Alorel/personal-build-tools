import {Argv, CommandModule} from 'yargs';
import {addEmail, addGhUser, addName, addUserWebsite} from '../commons/identity';
import {addConfig} from '../fns/addConfig';
import {cmdName} from '../fns/cmdName';
import {License, LICENSE_VALUES} from '../inc/License';
import {InitConf} from '../interfaces/InitConf';
import {initCodeOwners} from '../lib/init/initCodeOwners';
import {initGitignore} from '../lib/init/initGitignore';
import {initLicense} from '../lib/init/initLicense';
import {PromptableConfig} from '../lib/PromptableConfig';

const command = cmdName(__filename);

const cmd: CommandModule = {
  builder(argv: Argv) {
    addConfig(argv, 'init');
    addEmail(argv);
    addGhUser(argv);

    argv.option('license', {
      choices: LICENSE_VALUES,
      default: License.MIT,
      describe: 'License to use',
      string: true
    });

    addName(argv);

    argv.option('skip-code-owners', {
      default: false,
      describe: 'Skip .github/CODEOWNERS file generation',
      type: 'boolean'
    });

    argv.option('skip-gitignore', {
      boolean: true,
      default: false,
      describe: 'Don\'t generate gitignore'
    });

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
  handler(conf: InitConf) {
    const c = new PromptableConfig(conf);
    initLicense(c);
    initGitignore(c);
    initCodeOwners(c);
  }
};

export = cmd;
