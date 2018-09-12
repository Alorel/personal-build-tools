import {expect} from 'chai';
import * as fs from 'fs-extra';
import {join} from 'path';
import {alo} from '../../src/alo';
import {tmpDir} from '../util/tmp-test';

describe('init', () => {
  let origCwd: string;
  let tmpdir: string;
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

  before('snapshot cwd', () => {
    origCwd = process.cwd();
  });

  after('restore cwd', () => {
    if (origCwd) {
      process.chdir(origCwd);
    }
  });

  describe('CODEOWNERS', () => {
    describe('Don\'t skip', () => {
      before('cwd', mkTmpDir);
      before('run', runBase);

      it('', async () => {
        expect(await read('.github/CODEOWNERS'))
          .to.eq(['* @Alorel', ''].join('\n'));
      });
    });

    describe('skip', () => {
      before('cwd', mkTmpDir);
      before('run', () => run('--skip-code-owners'));

      it('', async () => {
        expect(await exists('.github/CODEOWNERS')).to.be.false;
      });
    });
  });

  describe('.gitignore', () => {
    describe('Don\'t skip', () => {
      before('change cwd', mkTmpDir);

      before('run', runBase);

      it('', async () => {
        expect(await read('.gitignore'))
          .to.eq([
          '.idea/',
          'node_modules/',
          'dist/',
          'coverage/',
          '.nyc_output/',
          'yarn-error.log',
          '*.tgz',
          'git_gpg_keys.asc'
        ].join('\n') + '\n');
      });
    });

    describe('skip', () => {
      before('change cwd', mkTmpDir);

      before('run', () => run('--skip-gitignore'));

      it('', async () => {
        expect(await exists('.gitignore')).to.be.false;
      });
    });
  });

  describe('LICENSE', () => {
    describe('Don\'t skip', () => {
      let expected: string;

      before('change cwd', mkTmpDir);

      before('init expected', () => {
        expected = `MIT License

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

      before('run', runBase);

      it('', async () => {
        expect(await read('LICENSE'))
          .to.eq(expected);
      });
    });

    describe('skip', () => {
      before('change cwd', mkTmpDir);

      before('run', () => run('--skip-license'));

      it('', async () => {
        expect(await exists('LICENSE')).to.be.false;
      });
    });
  });
});
