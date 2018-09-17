import * as fs from 'fs';
import {CommandModule} from 'yargs';
import {depFields} from '../const/depFields';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {flatGlob} from '../fns/getFiles';
import {sortObjectByKey} from '../fns/sortObjectByKey';

const command = cmdName(__filename);

interface Conf {
  cwd: string;

  globs: string[];

  indent: number;
}

const cmd: CommandModule = {
  builder(argv) {
    return addConfig(argv, command)
      .option('cwd', {
        alias: 'w',
        default: process.cwd(),
        defaultDescription: 'current directory',
        describe: 'Working directory. Globs will be relative to this.',
        string: true
      })
      .option('indent', {
        alias: 'i',
        default: 2,
        describe: 'JSON.stringify indentation',
        number: true
      })
      .option('globs', {
        alias: 'g',
        array: true,
        default: ['package.json'],
        describe: 'Globs containing package.json files'
      });
  },
  command,
  describe: 'Sort package.json dependencies, peerDependencies and devDependencies alphabetically',
  handler(c: Conf) {
    const files = flatGlob(c.globs, true, c.cwd);

    for (const file of files) {
      const contents = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const obj of depFields) {
        if (contents[obj]) {
          contents[obj] = sortObjectByKey(contents[obj]);
        }
      }

      fs.writeFileSync(file, JSON.stringify(contents, null, c.indent) + '\n');
    }
  }
};

export = cmd;
