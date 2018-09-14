import {noop} from 'lodash';
import {join} from 'path';
import {CommandModule} from 'yargs';
import {addCommandDir} from '../fns/add-cmd/addCommandDir';
import {cmdName} from '../fns/cmdName';

const cmd: CommandModule = {
  aliases: 'config',
  builder(argv) {
    return addCommandDir(join(__dirname, 'cfg'), argv, 1);
  },
  command: cmdName(__filename),
  describe: 'Modify config options shared by all projects',
  handler: noop
};

export = cmd;
