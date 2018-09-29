import * as fs from 'fs';
import {has, isEmpty, unset} from 'lodash';
import {CommandModule} from 'yargs';
import {depFields} from '../const/depFields';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {flatGlobDirs} from '../fns/getFiles';
import {sortObjectByKey} from '../fns/sortObjectByKey';

interface StrObj {
  [k: string]: string;
}

interface Conf {
  d: Conf['distDirs'];

  distDirs: string[];

  r: Conf['removeFields'];

  removeFields: string[];

  s: Conf['sortScripts'];

  scriptWhitelist: string[];

  skipCleanScripts: boolean;

  skipRemoveFields: boolean;

  skipSortDeps: boolean;

  sortScripts: boolean;

  w: Conf['scriptWhitelist'];
}

const command = cmdName(__filename);

function removeFields(contents: any, fields: string[]): void {
  for (const field of fields) {
    if (has(contents, field)) {
      unset(contents, field);
    }
  }
}

function removeScripts(contents: { scripts: StrObj }, whitelist: string[], sort: boolean): void {
  const scripts = contents.scripts;
  if (!scripts) {
    return;
  }

  let scriptNames: string[] = Object.keys(scripts);
  if (sort) {
    scriptNames = scriptNames.sort();
  }

  contents.scripts = scriptNames
    .filter(n => whitelist.indexOf(n) !== -1)
    .reduce<{ [k: string]: string }>(
      (acc, name) => {
        acc[name] = scripts[name];

        return acc;
      },
      {}
    );

  if (isEmpty(contents.scripts)) {
    delete contents.scripts;
  }
}

function sortDeps(contents: { dependencies?: StrObj; devDependencies?: StrObj; peerDependencies?: StrObj }): void {
  for (const topKey of depFields) {
    if (isEmpty(contents[topKey])) {
      continue;
    }

    contents[topKey] = sortObjectByKey(contents[topKey]);
  }
}

const cmd: CommandModule = {
  builder(argv) {
    const rmFields = [
      'devDependencies',
      'greenkeeper',
      'angularCompilerOptions',
      '$schema',
      'private'
    ].sort();

    const scriptWhitelist = [
      'preinstall',
      'install',
      'postinstall',
      'preuninstall',
      'postuninstall',
      'prestop',
      'stop',
      'poststop',
      'prestart',
      'start',
      'poststart',
      'prerestart',
      'restart',
      'postrestart'
    ].sort();

    return addConfig(argv, command)
      .option('dist-dirs', {
        alias: 'd',
        array: true,
        demandOption: true,
        describe: 'Directories containing package.json files'
      })
      .option('skip-clean-scripts', {
        boolean: true,
        default: false,
        describe: 'Don\'t clean the scripts section'
      })
      .option('skip-remove-fields', {
        boolean: true,
        default: false,
        describe: 'Don\'t remove any fields'
      })
      .option('skip-sort-deps', {
        boolean: true,
        default: false,
        describe: 'Don\'t sort dependencies alphabetically by name'
      })
      .option('remove-fields', {
        alias: 'r',
        array: true,
        default: rmFields,
        describe: 'Fields to remove from package.json'
      })
      .option('script-whitelist', {
        alias: 'w',
        array: true,
        default: scriptWhitelist,
        describe: 'Scripts to keep in package.json'
      })
      .option('sort-scripts', {
        alias: 's',
        boolean: true,
        default: false,
        describe: 'Sort scripts alphabetically by name'
      });
  },
  command,
  describe: 'Clean pre-dist package.json fields. Nested object paths can be separated by dot, e.g.: "foo.bar"',
  handler(c: Conf) {
    const files = flatGlobDirs(c.distDirs, '**/package.json');
    for (const file of files) {
      const contents: any = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!c.skipRemoveFields) {
        removeFields(contents, c.removeFields);
      }
      if (!c.skipCleanScripts) {
        removeScripts(contents, c.scriptWhitelist, c.sortScripts);
      }

      for (const f of depFields) {
        if (isEmpty(contents[f])) {
          delete contents[f];
        }
      }

      if (!c.skipSortDeps) {
        sortDeps(contents);
      }

      //tslint:disable-next-line:no-magic-numbers
      fs.writeFileSync(file, JSON.stringify(contents, null, 2).trim() + '\n');
    }
  }
};

export = cmd;
