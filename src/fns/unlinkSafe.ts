import * as fs from 'fs';

export function unlinkSafe(path: string): boolean {
  try {
    fs.unlinkSync(path);

    return true;
  } catch {
    return false;
  }
}
