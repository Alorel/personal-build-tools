import * as tmp from 'tmp';

tmp.setGracefulCleanup();

export function tmpDir(): string {
  return tmp.dirSync({unsafeCleanup: true}).name;
}

export function tmpFile(ext = '.tmp'): string {
  return tmp.fileSync({unsafeCleanup: true, postfix: ext}).name;
}
