import {readdirSync} from 'fs';
import {basename, join} from 'path';
import * as yargs from 'yargs';
import {checkCommand} from './fns/checkCommand';
import {Group} from './inc/Group';

const ext = /\.js$/.test(__filename) ? 'js' : 'ts';

const commandsNames: string[] = (() => {
  const reg = new RegExp(`\.${ext}$`);

  return readdirSync(join(__dirname, 'commands'), 'utf8')
    .filter(f => reg.test(f))
    .map(f => basename(f, `.${ext}`));
})();

let argv = yargs
  .scriptName('alo')
  .wrap(yargs.terminalWidth())
  .commandDir(join(__dirname, 'commands'), {recurse: true, extensions: [ext]})
  .help()
  .alias('v', 'version')
  .demandCommand(1, 'You must specify at least one command')
  .check(checkCommand(commandsNames));

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
