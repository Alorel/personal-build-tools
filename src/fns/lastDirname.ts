import {last} from 'lodash';

export function lastDirname(path?: string): string {
  return <string>last((path || process.cwd()).split(/[\\/]/g));
}
