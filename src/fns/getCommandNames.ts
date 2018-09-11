import {readdirSync} from 'fs';
import {basename} from 'path';
import {ext} from '../const/ext';

const reg = new RegExp(`\.${ext}$`);

function filter(f: string): boolean {
  return reg.test(f);
}

function map(f: string): string {
  return basename(f, `.${ext}`);
}

export function getCommandNames(dir: string): string[] {
  return readdirSync(dir, 'utf8')
    .filter(filter)
    .map(map);
}
