import * as fs from 'fs';
import * as JSON5 from 'json5';
import * as YAML from 'yamljs';
import {Argv} from 'yargs';

function loadConfig(p: string): any {
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

export function applyConfigOption<T extends Argv>(argv: T): T {
  return <T>argv.config('config', 'Path to config file', loadConfig)
    .alias('c', 'config');
}
