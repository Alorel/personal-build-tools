import {sync as glob$} from 'glob';
import {flattenGlob} from './flattenGlob';

export function flatGlob(dirs: string[], glob: string, absolute = true): string[] {
  return dirs.map<string[]>(cwd => glob$(glob, {cwd, absolute}))
    .reduce<string[]>(flattenGlob, []);
}

export function getFiles(dirs: string[], ext: string, absolute = true): string[] {
  return flatGlob(dirs, `**/*.${ext}`, absolute);
}
