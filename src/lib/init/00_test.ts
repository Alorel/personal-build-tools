import * as fs from 'fs-extra';
import {Git} from '../Git';
import {Log} from '../Log';

const enum Paths {
  MOCHA_OPTS = 'mocha.opts',
  SRC_INDEX = 'src/index.ts',
  TEST_STUB = 'test/stub.ts'
}

export function handle(): void {
  if (!fs.pathExistsSync(Paths.MOCHA_OPTS)) {
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
    fs.writeFileSync(Paths.MOCHA_OPTS, contents);
    Git.add(Paths.MOCHA_OPTS);
    Log.success('Created mocha.opts');
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
    fs.writeFileSync(Paths.TEST_STUB, contents);
    Git.add(Paths.TEST_STUB);
    Log.success('Created test/stub.ts');
  }

  if (!fs.pathExistsSync(Paths.SRC_INDEX)) {
    if (!fs.pathExistsSync('src')) {
      fs.mkdirpSync('src');
    }
    fs.writeFileSync(Paths.SRC_INDEX, '// stub\n');
    Git.add(Paths.SRC_INDEX);
    Log.success('Created src/index.ts');
  }
}
