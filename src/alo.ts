import {join} from 'path';
import * as yargs from 'yargs';
import {addCommandDir} from './fns/addCommandDir';
import {applyGlobalGroup} from './fns/applyGlobalGroup';

const argv = addCommandDir(join(__dirname, 'commands'), yargs)
  .scriptName('alo')
  .wrap(yargs.terminalWidth())
  .help()
  .alias('v', 'version');

applyGlobalGroup(argv);

export function alo(args: string | string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    argv.parse(args, {}, (err, _argv, output) => {
      if (err) {
        process.stderr.write(output);
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}

if (!process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS) {
  argv.global('config').parse();
}
