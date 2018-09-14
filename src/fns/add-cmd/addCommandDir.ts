import {Argv} from 'yargs';
import {ext} from '../../const/ext';
import {checkCommand} from '../checkCommand';
import {getCommandNames} from '../getCommandNames';

export function addCommandDir<T extends Argv>(dir: string, argv: T, depth = 0): T {
  return <T>argv.commandDir(dir, {recurse: false, extensions: [ext]})
    .demandCommand(1, 'You must specify at least one command')
    .check(checkCommand(getCommandNames(dir), depth));
}
