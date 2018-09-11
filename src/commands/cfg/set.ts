import * as JSON5 from 'json5';
import {CommandModule} from 'yargs';
import {addCfgKey, addCfgScope, CfgRmConf} from '../../commons/cfg';
import {applyGlobalGroup} from '../../fns/applyGlobalGroup';
import {cmdName} from '../../fns/cmdName';
import {ConfigWriter} from '../../lib/ConfigWriter';

interface CfgSetConf extends CfgRmConf {
  value: any;
}

const cmd: CommandModule = {
  builder(argv) {
    addCfgKey(argv);
    applyGlobalGroup(argv);

    argv.positional('value', {
      coerce(v: any): any {
        try {
          return JSON5.parse(v);
        } catch {
          return v;
        }
      },
      describe: 'Config value. Can optionally be a JSON5-parseable item.'
    });

    return addCfgScope(argv);
  },
  command: `${cmdName(__filename)} <key> <value> [scope]`,
  describe: 'Set a config option shared by all projects',
  handler(c: CfgSetConf) {
    new ConfigWriter().set(c.key, c.value, c.scope).save();
  }
};

export = cmd;
