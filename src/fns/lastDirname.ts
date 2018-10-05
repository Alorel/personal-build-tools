import {last} from 'lodash';
import {sep} from 'path';

const splitRegex = new RegExp(sep, 'g');

export function lastDirname(path?: string): string {
  return <string>last((path || process.cwd()).split(splitRegex));
}
