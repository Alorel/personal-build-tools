import * as fs from 'fs-extra';
import {IOptions, sync as glob} from 'glob';
import * as _ from 'lodash';
import {basename, dirname, join} from 'path';
import {CommandModule} from 'yargs';
import {addConfig} from '../lib/addConfig';
import {cmdName} from '../lib/cmdName';
import {flattenGlob} from '../lib/flattenGlob';

interface Conf {
  from: string[];

  to: string[];
}

interface FromTo {
  from: string;

  to: string;
}

const command = cmdName(__filename);

const cmd: CommandModule = {
  builder(argv) {
    return addConfig(argv, command)
    // from
      .array('from')
      .alias('f', 'from')
      .demandOption('from')
      .describe('from', 'Glob(s) to copy')
      // to
      .array('to')
      .alias('t', 'to')
      .demandOption('to')
      .describe('to', 'Dir(s) to copy to');
  },
  command,
  describe: 'Copy files from point A to point B',
  handler(c: Conf) {
    if (!c.from.length || !c.to.length) {
      throw new Error('At least one from/to path is required');
    }
    if (c.to.length !== 1 && c.to.length !== c.from.length) {
      throw new Error('"to" must either contain 1 path or have the same number of paths as "from"');
    }

    const opts: IOptions = {cwd: process.cwd()};

    const fromTos = c.from
      .map<FromTo[]>((p, idx) => {
        return glob(p, opts)
          .map<FromTo>(from => {
            return {from, to: join(c.to[idx] || c.to[0], basename(from))};
          });
      })
      .reduce<FromTo[]>(flattenGlob, []);

    _(fromTos)
      .map('to')
      .map(dirname)
      .uniq()
      .forEach(dir => fs.mkdirpSync(dir));

    for (const ft of fromTos) {
      fs.copySync(ft.from, ft.to, {dereference: true, preserveTimestamps: true});
    }
  }
};

export = cmd;
