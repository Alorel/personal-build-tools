import {Argv, Options} from 'yargs';
import {Nil} from '../interfaces/Nil';

export function addCfgKey<T extends Argv>(argv: T): T {
  return <T>argv.positional('key', {
    describe: 'Config key',
    type: 'string'
  });
}

export function addPwd<T extends Argv>(argv: T): T {
  return <T>argv.option('password', {
    alias: 'pwd',
    describe: 'Encryption password',
    type: 'string'
  });
}

export function addEncrypt<T extends Argv>(argv: T, alias: string | Nil = 'enc'): T {
  const opt: Options = {
    default: false,
    describe: 'Encrypt the input',
    type: 'boolean'
  };

  if (alias) {
    opt.alias = alias;
  }

  return <T>argv.option('encrypt', opt);
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
