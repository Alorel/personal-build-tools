import * as readline from 'readline-sync';
import {CommandModule} from 'yargs';
import {applyGlobalGroup} from '../../fns/add-cmd/applyGlobalGroup';
import {cmdName} from '../../fns/cmdName';
import {ConfigWriter} from '../../lib/ConfigWriter';

function prompt(): boolean {
  return readline.keyInYNStrict('Are you sure you want to remove shared config? ');
}

interface Yes {
  yes: boolean;
}

const cmd: CommandModule<any, Yes> = {
  builder(argv): any {
    return applyGlobalGroup(argv)
      .option('yes', {
        alias: 'y',
        boolean: true,
        default: false,
        describe: 'Skip confirmation and proceed with removal'
      });
  },
  command: cmdName(__filename),
  describe: 'Fully clear config shared by all projects',
  handler(c: Yes) {
    if (!c.yes && !prompt()) {
      process.exit(1);
    }

    new ConfigWriter().clear();
  }
};

export = cmd;
