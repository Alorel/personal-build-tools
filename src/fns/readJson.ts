import * as fs from 'fs';
import {PackageJson} from '../interfaces/PackageJson';

export function readJson(path = 'package.json'): PackageJson | null {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
