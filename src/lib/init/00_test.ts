import * as fs from 'fs-extra';
import {Git} from '../Git';

export function handle(): void {
  if (!fs.pathExistsSync('mocha.opts')) {
    const contents = [
      '--check-leaks',
      '--exit',
      '--full-trace',
      '-r ts-node/register',
      '-r source-map-support/register',
      '-t 10000',
      '--trace-deprecation',
      '--trace-warnings',
      '--throw-deprecation',
      '--recursive',
      '--watch-extensions ts',
      'test/**/*.ts'
    ].join('\n') + '\n';
    fs.writeFileSync('mocha.opts', contents);
    Git.add('mocha.opts');
  }

  if (!fs.pathExistsSync('test')) {
    fs.mkdirpSync('test');
    const contents = [
      'import {expect} from \'chai\';',
      '',
      'describe(\'Stub test suite\', function () {',
      '  it(\'Stub test\', () => {',
      '    console.log(\'I pass!\');',
      '  });',
      '});'
    ].join('\n') + '\n';
    fs.writeFileSync('test/stub.ts', contents);
    Git.add('test/stub.ts');
  }
}
