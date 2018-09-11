import {Argv} from 'yargs';
import {Group} from '../inc/Group';

const globals = ['version', 'help'];

export function applyGlobalGroup<T extends Argv>(argv: T): T {
  for (const k of globals) {
    argv.group(k, Group.GLOBAL_OPTIONS);
  }

  return argv;
}
