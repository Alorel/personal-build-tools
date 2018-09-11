import {join} from 'path';
import * as yargs from 'yargs';
import {ext} from './const/ext';
import {checkCommand} from './fns/checkCommand';
import {getCommandNames} from './fns/getCommandNames';
import {Group} from './inc/Group';

let argv = yargs
  .scriptName('alo')
  .wrap(yargs.terminalWidth())
  .commandDir(join(__dirname, 'commands'), {recurse: true, extensions: [ext]})
  .help()
  .alias('v', 'version')
  .demandCommand(1, 'You must specify at least one command')
  .check(checkCommand(getCommandNames(join(__dirname, 'commands'))));

for (const k of ['version', 'help']) {
  argv = yargs.group(k, Group.GLOBAL_OPTIONS);
}

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
