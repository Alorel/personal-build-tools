import {sync as glob$} from 'glob';
import {flattenGlob} from './flattenGlob';

export function flatGlob(globs: string[], absolute = true, cwd = process.cwd()): string[] {
  return globs.map<string[]>(glob => glob$(glob, {cwd, absolute}))
    .reduce<string[]>(flattenGlob, []);
}

export function flatGlobDirs(dirs: string[], glob: string, absolute = true): string[] {
  return dirs.map<string[]>(cwd => glob$(glob, {cwd, absolute}))
    .reduce<string[]>(flattenGlob, []);
}

export function getFiles(dirs: string[], ext: string, absolute = true): string[] {
  return flatGlobDirs(dirs, `**/*.${ext}`, absolute);
}
