import {Argv, CommandModule} from 'yargs';
import {addEmail, addGhRepo, addGhUser, addName, addUserWebsite} from '../commons/identity';
import {addConfig} from '../fns/addConfig';
import {cmdName} from '../fns/cmdName';
import {initCodeOwners} from '../fns/init/initCodeOwners';
import {initGhTemplates} from '../fns/init/initGhTemplates';
import {initGitignore} from '../fns/init/initGitignore';
import {initLicense} from '../fns/init/initLicense';
import {LICENSE_VALUES} from '../inc/License';
import {isPkgManager, PACKAGE_MANAGERS, PackageManager} from '../inc/PackageManager';
import {InitConf} from '../interfaces/InitConf';
import {PromptableConfig} from '../lib/PromptableConfig';

const command = cmdName(__filename);

const cmd: CommandModule = {
  builder(argv: Argv) {
    addConfig(argv, 'init');
    addEmail(argv);
    addGhUser(argv);
    addGhRepo(argv);

    argv.option('license', {
      choices: LICENSE_VALUES,
      describe: 'License to use',
      string: true
    });

    addName(argv);

    argv
      .option('pkg-mgr', {
        alias: 'pkg',
        choices: PACKAGE_MANAGERS,
        default: PackageManager.YARN,
        describe: 'Package manager in use'
      })
      .option('skip-code-owners', {
        default: false,
        describe: 'Skip .github/CODEOWNERS file generation',
        type: 'boolean'
      })
      .option('skip-gh-issue-tpl', {
        default: false,
        describe: 'Skip issue & contribution template generation',
        type: 'boolean'
      })
      .option('skip-gitignore', {
        boolean: true,
        default: false,
        describe: 'Don\'t generate gitignore'
      })
      .option('skip-license', {
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
    if (!isPkgManager(conf.pkgMgr)) {
      throw new Error(`Invalid package manager: ${conf.pkgMgr}`);
    }

    const c = new PromptableConfig(conf);
    initLicense(c);
    initGitignore(c);
    initCodeOwners(c);
    initGhTemplates(c);
  }
};

export = cmd;
