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
    'https://foo.com'
  ];

  before('snapshot cwd', () => {
    origCwd = process.cwd();
  });

  after('restore cwd', () => {
    if (origCwd) {
      process.chdir(origCwd);
    }
  });

  describe('gitignore', () => {
    describe('Don\'t skip', () => {
      before('change cwd', () => {
        tmpdir = tmpDir();
        process.chdir(tmpdir);
      });

      before('run', () => alo(baseArgs));

      it('', async () => {
        expect(await fs.readFile(join(tmpdir, '.gitignore'), 'utf8'))
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
      before('change cwd', () => {
        tmpdir = tmpDir();
        process.chdir(tmpdir);
      });

      before('run', () => alo(baseArgs.concat('--skip-gitignore')));

      it('', async () => {
        expect(await fs.pathExists(join(tmpdir, '.gitignore'))).to.be.false;
      });
    });
  });

  describe('license', () => {
    describe('Don\'t skip', () => {
      let expected: string;

      before('change cwd', () => {
        tmpdir = tmpDir();
        process.chdir(tmpdir);
      });

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

      before('run', () => alo(baseArgs));

      it('', async () => {
        expect(await fs.readFile(join(tmpdir, 'LICENSE'), 'utf8'))
          .to.eq(expected);
      });
    });

    describe('skip', () => {
      before('change cwd', () => {
        tmpdir = tmpDir();
        process.chdir(tmpdir);
      });

      before('run', () => alo(baseArgs.concat('--skip-license')));

      it('', async () => {
        expect(await fs.pathExists(join(tmpdir, 'LICENSE'))).to.be.false;
      });
    });
  });
});
