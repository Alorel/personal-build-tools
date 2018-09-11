import * as fs from 'fs';
import * as JSON5 from 'json5';
import {cloneDeep, merge} from 'lodash';
import {homedir} from 'os';
import {join} from 'path';
import * as YAML from 'yamljs';
import {Argv} from 'yargs';
import {defaultCfgName} from '../inc/defaultCfgName';
import {Group} from '../inc/Group';

function readCfg(p: string): any {
  if (/\.js(on)?$/.test(p)) {
    return require(p) || {}; //tslint:disable-line:no-var-requires
  } else {
    const contents = fs.readFileSync(p, 'utf8');

    if (p.endsWith('.json5')) {
      return JSON5.parse(contents);
    } else if (/\.ya?ml$/.test(p)) {
      return YAML.parse(contents) || {};
    }
  }

  throw new Error('The file must be in json, json5, or yml/yaml format');
}

function loadCfgFromPath(p: string, key: string): any {
  try {
    const rawContents = readCfg(p);
    const keyContents = cloneDeep(rawContents[key] || {});
    const globalContents = cloneDeep(rawContents.global || {});

    return merge(globalContents, keyContents);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return {};
    }

    throw e;
  }
}

function loadConfig(key: string): (path: string) => any {
  return (p: string): any => {
    const global = cloneDeep(loadCfgFromPath(join(homedir(), defaultCfgName), key));
    const local = cloneDeep(loadCfgFromPath(p, key));

    return merge(global, local);
  };
}

export function addConfig<T extends Argv = Argv>(argv: T, key: string): T {
  return <T>argv.config('config', 'Path to config file (optional)', loadConfig(key))
    .default('config', defaultCfgName)
    .alias('c', 'config')
    .group('config', Group.GLOBAL_OPTIONS);
}
