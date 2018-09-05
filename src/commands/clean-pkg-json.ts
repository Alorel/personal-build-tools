import * as fs from 'fs';
import {has, isEmpty, unset} from 'lodash';
import {CommandModule} from 'yargs';
import {addConfig} from '../lib/addConfig';
import {cmdName} from '../lib/cmdName';
import {depFields} from '../lib/depFields';
import {flatGlob} from '../lib/getFiles';
import {sortObjectByKey} from '../lib/sortObjectByKey';

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
      'alo',
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
    // dist-dirs
      .array('dist-dirs')
      .alias('d', 'dist-dirs')
      .demandOption('dist-dirs')
      .describe('dist-dirs', 'Directories containing package.json files')
      // skip-clean-scripts
      .boolean('skip-clean-scripts')
      .default('skip-clean-scripts', false)
      .describe('skip-clean-scripts', 'Don\'t clean the scripts section')
      // skip-remove-fields
      .boolean('skip-remove-fields')
      .default('skip-remove-fields', false)
      .describe('skip-remove-fields', 'Don\'t remove any fields')
      // skip-sort-deps
      .boolean('skip-sort-deps')
      .default('skip-sort-deps', false)
      .describe('skip-sort-deps', 'Don\'t sort dependencies alphabetically by name')
      // remove-fields
      .array('remove-fields')
      .alias('r', 'remove-fields')
      .default('remove-fields', rmFields)
      .describe('remove-fields', 'Fields to remove from package.json')
      // script-whitelist
      .array('script-whitelist')
      .alias('w', 'script-whitelist')
      .default('script-whitelist', scriptWhitelist)
      .describe('script-whitelist', 'Scripts to keep in package.json')
      // sort-scripts
      .boolean('sort-scripts')
      .alias('s', 'sort-scripts')
      .default('sort-scripts', false)
      .describe('sort-scripts', 'Sort scripts alphabetically by name');
  },
  command,
  describe: 'Clean pre-dist package.json fields. Nested object paths can be separated by dot, e.g.: "foo.bar"',
  handler(c: Conf) {
    const files = flatGlob(c.distDirs, '**/package.json');
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
      fs.writeFileSync(file, JSON.stringify(contents, null, 2));
    }
  }
};

export = cmd;
