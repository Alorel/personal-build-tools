import {join} from 'path';
import * as yargs from 'yargs';
import {Group} from './inc/Group';

yargs
  .scriptName('alo')
  .commandDir(join(__dirname, 'commands'), {recurse: true, extensions: ['ts', 'js']})
  .help()
  .pkgConf('alo')
  .alias('v', 'version')
  .demandCommand(1, 1, 'You must specify exactly one command');

for (const k of ['version', 'help']) {
  yargs.group(k, Group.GLOBAL_OPTIONS);
}

export function alo(args: string | string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    yargs.parse(args, {}, (err, _argv, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}

if (!process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS) {
  yargs.parse();
}
