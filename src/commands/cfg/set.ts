import * as JSON5 from 'json5';
import {CommandModule} from 'yargs';
import {addCfgKey, addCfgScope, addEncrypt, addPwd, CfgRmConf} from '../../commons/cfg';
import {applyGlobalGroup} from '../../fns/add-cmd/applyGlobalGroup';
import {cmdName} from '../../fns/cmdName';
import {ConfigWriter} from '../../lib/ConfigWriter';
import {Crypt} from '../../lib/Crypt';
import {PromptableConfig} from '../../lib/PromptableConfig';

interface CfgSetConf extends CfgRmConf {
  encrypt: boolean;

  password: string;

  value: any;
}

const cmd: CommandModule = {
  builder(argv) {
    addCfgKey(argv);
    applyGlobalGroup(argv);
    addEncrypt(argv);
    addPwd(argv);

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
  handler(c$: CfgSetConf) {
    let val: any;

    if (c$.encrypt) {
      if (typeof c$.value !== 'string') {
        throw new Error('Only strings can be encrypted');
      }
      const c = new PromptableConfig(c$);
      val = Crypt.encryptVar(c$.value, c.promptedEncryptionPassword());
    } else {
      val = c$.value;
    }

    new ConfigWriter().set(c$.key, val, c$.scope).save();
  }
};

export = cmd;
