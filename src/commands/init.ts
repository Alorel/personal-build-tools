import * as fs from 'fs-extra';
import {isEmpty} from 'lodash';
import {dirname, join} from 'path';
import {Argv, CommandModule, Options} from 'yargs';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {sortObjectByKey} from '../fns/sortObjectByKey';
import {InitConf} from '../interfaces/InitConf';
import {Obj} from '../interfaces/OptionsObject';
import {PromptableConfig} from '../lib/PromptableConfig';

const command = cmdName(__filename);

interface InitModule {
  options?: Obj<Options>[];

  handle(c: PromptableConfig<InitConf>): void;
}

const modulesDir = dirname(require.resolve('../lib/init/license'));
const initModules: InitModule[] = fs.readdirSync(modulesDir, 'utf8')
  .map(p => require(join(modulesDir, p)));

const cmd: CommandModule = {
  builder(argv: Argv) {
    addConfig(argv, 'init');
    const opts: Obj<Options> = {};
    for (const mod of initModules) {
      if (!isEmpty(mod.options)) {
        Object.assign(opts, mod.options);
      }
    }

    return argv.options(sortObjectByKey(opts));
  },
  command,
  describe: 'Project initialisation operations',
  handler(conf: InitConf) {
    const c = new PromptableConfig(conf);
    for (const mod of initModules) {
      mod.handle(c);
    }
  }
};

export = cmd;
