import {basename} from 'path';
import {ext as ext$} from '../const/ext';

const ext = `.${ext$}`;

export function cmdName(currFile: string): string {
  return basename(currFile, ext);
}
