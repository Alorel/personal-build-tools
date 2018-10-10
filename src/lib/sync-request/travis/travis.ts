import {SpawnSyncReturns} from 'child_process';
import {memoize, pick, reduce} from 'lodash';
import {join} from 'path';
import {ext} from '../../../const/ext';
import {execLocal} from '../../../fns/execLocal';
import {Log} from '../../Log';

export interface BaseArgs {
  owner: string;

  pro?: boolean;

  repo: string;

  token: string;
}

export interface VarExistsArgs extends BaseArgs {
  name: string;
}

export interface SetEnvVarArgs extends VarExistsArgs {
  public?: boolean;

  value: string;
}

const execPath = join(__dirname, `request.${ext}`);

function throwErr(ret: SpawnSyncReturns<string>): void {
  switch (ret.status) {
    case 0:
      break;
    case 1:
      throw new Error(ret.stderr || ret.stdout);
    default:
      throw new Error(`HTTP ${ret.status}`);
  }
}

function argReducer(acc: string[], val: undefined | string | boolean, key: string): string[] {
  if (typeof val === 'boolean') {
    acc.push(`--${key}=${val.toString()}`);
  } else {
    acc.push(`--${key}`, (<any>val).toString());
  }

  return acc;
}

function getEnvVars$(ort: BaseArgs): string[] {
  Log.info(`Querying travis-ci env var names in ${ort.owner}/${ort.repo}`);

  const args: string[] = reduce(ort, argReducer, ['get-env-vars']);
  const ret = execLocal(execPath, args);
  throwErr(ret);

  return JSON.parse(ret.stdout);
}

//tslint:disable-next-line:no-unbound-method
export const getEnvVars: typeof getEnvVars$ = memoize(getEnvVars$, JSON.stringify);

export function envVarExists(ort: VarExistsArgs): boolean {
  type PickedProps = 'owner' | 'pro' | 'repo' | 'token';
  const partialOrt: Pick<VarExistsArgs, PickedProps> = pick(ort, [
    'owner',
    'pro',
    'repo',
    'token'
  ]);

  return getEnvVars(partialOrt).includes(ort.name);
}

export function setEnvVar(ort: SetEnvVarArgs): void {
  if (!envVarExists(ort)) {
    Log.info(`Setting env var ${ort.name}`);
    const args: string[] = reduce(ort, argReducer, ['set-env-var']);
    const ret = execLocal(execPath, args);
    throwErr(ret);
    Log.success(`Successully set env var ${ort.name}`);
  } else {
    Log.info(`Skipping env var ${ort.name}: already exists.`);
  }
}

export function setStdSettings(ort: BaseArgs): void {
  Log.info('Setting base travis-ci configuration');
  const args: string[] = reduce(ort, argReducer, ['set-std-settings']);
  const ret = execLocal(execPath, args);
  throwErr(ret);
  Log.success('Base travis-ci configuration set');
}
