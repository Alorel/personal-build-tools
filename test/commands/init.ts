import {expect} from 'chai';
import * as fs from 'fs-extra';
import {castArray} from 'lodash';
import {join} from 'path';
import {alo} from '../../src/alo';
import {tmpDir} from '../util/tmp-test';

interface TestSpec {
  expect: any;

  file: string;

  skipFlags: string | string[];
}

describe('init', () => {
  let origCwd: string;
  let tmpdir: string;
  let expectedLicense: string;
  const baseArgs = [
    'init',
    '--name',
    'foo',
    '--email',
    'foo@bar.com',
    '--user-website',
    'https://foo.com',
    '--gh-user',
    'Alorel'
  ];

  function runBase(): Promise<any> {
    return alo(baseArgs);
  }

  function run(...args: string[]): Promise<any> {
    return alo(baseArgs.concat(args));
  }

  function mkTmpDir() {
    tmpdir = tmpDir();
    process.chdir(tmpdir);
  }

  function read(file: string): Promise<string> {
    return fs.readFile(join(tmpdir, file), 'utf8');
  }

  function exists(file: string): Promise<boolean> {
    return fs.pathExists(join(tmpdir, file));
  }

  const testSpecs: TestSpec[] = [
    {
      expect: '* @Alorel\n',
      file: '.github/CODEOWNERS',
      skipFlags: '--skip-code-owners'
    },
    {
      expect: [
        '.idea/',
        'node_modules/',
        'dist/',
        'coverage/',
        '.nyc_output/',
        'yarn-error.log',
        '*.tgz',
        'git_gpg_keys.asc',
        ''
      ].join('\n'),
      file: '.gitignore',
      skipFlags: '--skip-gitignore'
    },
    {
      expect: () => expectedLicense,
      file: 'LICENSE',
      skipFlags: '--skip-license'
    }
  ];

  before('snapshot cwd', () => {
    origCwd = process.cwd();
  });

  after('restore cwd', () => {
    if (origCwd) {
      process.chdir(origCwd);
    }
  });

  before('init expected LICENSE', () => {
    expectedLicense = `MIT License

Copyright (c) ${new Date().getFullYear()} foo <foo@bar.com> (https://foo.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  });

  for (const s of testSpecs) {
    describe(s.file, () => {
      describe('Don\'t skip', () => {
        before('Set cwd', mkTmpDir);
        before('Run', runBase);

        it('Contents should match expected', async () => {
          const expected = typeof s.expect === 'function' ? s.expect() : s.expect;
          expect(await read(s.file)).to.eq(expected);
        });
      });

      describe('Skip', () => {
        before('Set cwd', mkTmpDir);
        before('Run', () => run(...castArray(s.skipFlags)));

        it('File should not exist', async () => {
          expect(await exists(s.file)).to.be.false;
        });
      });
    });
  }
});
