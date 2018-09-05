import {basename, extname} from 'path';

const ext = extname(__filename);

export function cmdName(currFile: string): string {
  return basename(currFile, ext);
}
