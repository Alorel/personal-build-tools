import {CommandModule} from 'yargs';
import {addCfgKey, addCfgScope, CfgRmConf} from '../../commons/cfg';
import {applyGlobalGroup} from '../../fns/applyGlobalGroup';
import {cmdName} from '../../fns/cmdName';
import {ConfigWriter} from '../../lib/ConfigWriter';

const cmd: CommandModule = {
  builder(argv) {
    applyGlobalGroup(argv);
    addCfgKey(argv);

    return addCfgScope(argv);
  },
  command: `${cmdName(__filename)} <key> [scope]`,
  describe: 'Remove a config option shared by all projects',
  handler(c: CfgRmConf) {
    new ConfigWriter().unset(c.key, c.scope).save();
  }
};

export = cmd;
