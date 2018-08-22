import * as fs from 'fs-extra';
import {IOptions, sync as glob} from 'glob';
import * as _ from 'lodash';
import {basename, dirname, join} from 'path';
import {CommandModule} from 'yargs';
import {applyConfigOption} from '../lib/loadConfig';

interface Conf {
  from: string[];
  to: string[];
}

interface FromTo {
  from: string;
  to: string;
}

const cmd: CommandModule = {
  builder(argv) {
    return applyConfigOption(argv)
      .array('from')
      .demandOption('from')
      .describe('from', 'Glob(s) to copy')
      .array('to')
      .demandOption('to')
      .describe('to', 'Dir(s) to copy to');
  },
  command: 'copy-files',
  describe: 'Copy files from point A to point B',
  async handler(c: Conf) {
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
      .reduce<FromTo[]>(
        (acc, sources) => {
          acc.push(...sources);

          return acc;
        },
        []
      );

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
