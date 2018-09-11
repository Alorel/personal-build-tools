import {Argv} from 'yargs';

export function addCfgKey<T extends Argv>(argv: T): T {
  return <T>argv.positional('key', {
    describe: 'Config key',
    type: 'string'
  });
}

export function addCfgScope<T extends Argv>(argv: T): T {
  return <T>argv.positional('scope', {
    describe: 'Optional scope of the config key (defaults to global)',
    type: 'string'
  });
}

export interface CfgRmConf {
  key: string;

  scope?: string;
}
