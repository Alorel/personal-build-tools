import * as deleteEmpty from 'delete-empty';
import * as fs from 'fs';
import {basename, dirname, join} from 'path';
import {CommandModule} from 'yargs';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {getFiles} from '../fns/getFiles';

interface Conf {
  d: Conf['distDirs'];

  distDirs: string[];
}

const enum LineType {
  DEF_ESM,
  SRC_MAP,
  USE_STRICT,
  ANY
}

function getNonEmptyLines(contents: string): string[] {
  return contents.trim()
    .split(/\n/g)
    .map(l => l.trim())
    .filter(l => !!l);
}

function processDts(dirs: string[]): void {
  const files = getFiles(dirs, 'd.ts');

  if (!files.length) {
    return;
  }

  const reg = /^export\s*{};?\s*$/;
  let stat: fs.Stats;
  let lines: string[];
  let contents: string;

  for (const file of files) {
    try {
      stat = fs.lstatSync(file);
      if (!stat.isFile()) {
        continue;
      }
      contents = fs.readFileSync(file, 'utf8');
      lines = getNonEmptyLines(contents);

      if (lines.length !== 1 || !reg.test(lines[0])) {
        continue;
      }

      fs.unlinkSync(file);
    } catch (e) {
      console.error('Error processing', file, e);
      process.exit(1);
    }
  }
}

const jsReg = {
  //tslint:disable-next-line:max-line-length
  defEsm: /^\s*Object\s*\.\s*defineProperty\s*\(\s*(module\s*\.\s*)?exports\s*,\s*['"]__esModule['"]\s*,\s*{\s*value\s*:\s*true\s*}\s*\)\s*;?\s*$/i,
  srcMap: /^\s*\/\s*\/\s*#\s*sourceMappingURL\s*=\s*.+\s*$/i,
  useStrict: /^\s*['"]use strict['"]\s*;?\s*$/i
};

function getLineType(line: string): LineType {
  if (jsReg.defEsm.test(line)) {
    return LineType.DEF_ESM;
  } else if (jsReg.srcMap.test(line)) {
    return LineType.SRC_MAP;
  } else if (jsReg.useStrict.test(line)) {
    return LineType.USE_STRICT;
  } else {
    return LineType.ANY;
  }
}

function shouldDeleteJs(lines: string[]): boolean {
  //tslint:disable:no-magic-numbers
  let l1: LineType;
  let l2: LineType;

  switch (lines.length) {
    case 1:
      return getLineType(lines[0]) !== LineType.ANY;
    case 2:
      l1 = getLineType(lines[0]);
      l2 = getLineType(lines[1]);

      return (
        (l1 === LineType.USE_STRICT && (l2 === LineType.DEF_ESM || l2 === LineType.SRC_MAP))
        || (l1 === LineType.DEF_ESM && l2 === LineType.SRC_MAP)
      );
    case 3:
      l1 = getLineType(lines[0]);
      l2 = getLineType(lines[1]);
      const l3 = getLineType(lines[2]);

      return l1 === LineType.USE_STRICT && l2 === LineType.DEF_ESM && l3 === LineType.SRC_MAP;
    default:
      return false;
  }
  //tslint:enable:no-magic-numbers
}

function processJs(dirs: string[]): void {
  const files = getFiles(dirs, 'js');

  if (!files.length) {
    return;
  }

  let contents: string;
  let lines: string[];
  let mapFile: string;
  let stat: fs.Stats;

  for (const file of files) {
    try {
      stat = fs.lstatSync(file);
      if (!stat.isFile()) {
        continue;
      }
      contents = fs.readFileSync(file, 'utf8');
      lines = getNonEmptyLines(contents);

      if (!shouldDeleteJs(lines)) {
        continue;
      }

      fs.unlinkSync(file);
      mapFile = join(dirname(file), `${basename(file)}.map`);
      if (fs.existsSync(mapFile)) {
        fs.unlinkSync(mapFile);
      }
    } catch (e) {
      console.error('Error processing', file, e);
      process.exit(1);
    }
  }
}

const command = cmdName(__filename);

const cmd: CommandModule<any, Conf> = {
  builder(argv): any {
    return addConfig(argv, command)
      .option('dist-dirs', {
        alias: 'd',
        array: true,
        demandOption: true,
        describe: 'Directories to recursively scan'
      });
  },
  command,
  describe: 'Clean dist directory from empty interface JS files and internal declarations',
  handler(c: Conf) {
    processDts(c.distDirs);
    processJs(c.distDirs);
    for (const d of c.distDirs) {
      deleteEmpty.sync(d);
    }
  }
};

export = cmd;
