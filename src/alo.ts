import {join} from 'path';
import * as yargs from 'yargs';
import {Group} from './inc/Group';
import {applyConfigOption} from './lib/loadConfig';

let argv = yargs
  .scriptName('alo')
  .commandDir(join(__dirname, 'commands'), {recurse: true, extensions: ['ts', 'js']})
  .help()
  .pkgConf('alo')
  .alias('v', 'version')
  .demandCommand(1, 'You must specify at least one command');

for (const k of ['version', 'help']) {
  argv = yargs.group(k, Group.GLOBAL_OPTIONS);
}

argv = applyConfigOption(yargs);

export function alo(args: string | string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    argv.parse(args, {}, (err, _argv, output) => {
      if (err) {
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
