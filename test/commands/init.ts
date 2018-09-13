import {expect} from 'chai';
import * as fs from 'fs-extra';
import {castArray, forEach, noop} from 'lodash';
import {Test} from 'mocha';
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
    'Alorel',
    '--gh-repo',
    'personal-build-tools'
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
        'package-lock.json',
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

  describe('GitHub issue templates', () => {
    describe('Don\'t skip', function () {
      before('Set cwd', mkTmpDir);
      before('Run', runBase);

      const files: { [k: string]: string } = {};
      //tslint:disable:max-line-length

      before('init CONTRIBUTING.md', () => {
        files['CONTRIBUTING.md'] = `- Please only include exactly one feature/bugfix per commit.
- Please use the [Angular commit message format](https://github.com/bcoe/conventional-changelog-standard/blob/61da424c2aabf93ff9302b42d6fc2c17ff95c087/convention.md) for your commits.
  - When applicable, please use an appropriate scope, e.g. if fixing a bug in the *foo* feature, the commit message could look something like \`fix(foo): The hug() method no longer eats babies\`.
- Please ensure that your branch is up to date with master before opening the pull request.
- Please ensure that there is adequate test coverage for your code: run \`yarn test\` and see the \`coverage\` directory.
- Please lint your work; see [package.json](https://github.com/Alorel/personal-build-tools/blob/master/package.json).
- Please ensure that your code is well-documented. Add README entries if applicable.
- If your pull request is a work in progress, please start the title with \`[WIP]\`, e.g. \`[WIP] One glorious feature\`
- Please ensure you use [yarn package manager](https://yarnpkg.com) and not npm.
`;
      });

      before('init ISSUE_TEMPLATE.md', () => {
        files['ISSUE_TEMPLATE.md'] = `- [ ] I have read the README and API docs (if applicable); the issue is not covered there.
- [ ] I have searched the repository issues and pull requests; my query is not covered there.

-----

Issue goes here.
`;
      });

      before('init PULL_REQUEST_TEMPLATE.md', () => {
        files['PULL_REQUEST_TEMPLATE.md'] = `- [ ] I have read and followed the [contribution guidelines](https://github.com/Alorel/personal-build-tools/blob/master/.github/CONTRIBUTING.md).

My pull request is a:

- [ ] Feature
- [ ] Bug fix
- [ ] Documentation fix
- [ ] Other

-----
`;
      });

      before('init ISSUE_TEMPLATE/bug_report.md', () => {
        files['ISSUE_TEMPLATE/bug_report.md'] = `---
name: Bug Report
about: Something isn't working

---

- [ ] I have read the README and API docs (if applicable); the issue is not covered there.
- [ ] I have searched the repository issues and pull requests; my query is not covered there.

-----

- **Expected behaviour**: XXXXX
- **Actual behaviour**: XXXXX
- **Environment**:
  - **Node version**: x.y.z
  - **Browser and browser version (if applicable)**: XXXXX 
- **Steps to reproduce**:
  - Step 1
  - Step 2
  - ...
  - Step n
- **Reproducible code sample**:
  - **[stackblitz.com](https://stackblitz.com)** (preferred):
  - **Git repository** (*only* if a Stackblitz example is not possible):
  
-----

Additional information, screenshots etc go here.
`;
      });

      before('init ISSUE_TEMPLATE/feature_request.md', () => {
        files['ISSUE_TEMPLATE/feature_request.md'] = `---
name: Feature Request
about: I want new functionality

---

- [ ] I have read the README and API docs (if applicable); the issue is not covered there.
- [ ] I have searched the repository issues and pull requests; my query is not covered there.

-----

- **Describe the feature**: XXXXX
- **Why it is needed** (include use cases): XXXXX
- **Pseudocode** (non-functional schematic of how it could operate):
\`\`\`javascript
const code = await getCode();
await makePR(code);
\`\`\`
- [ ] I would be able to implement this feature and make a pull request.
  
-----

Additional information goes here.
`;
      });

      before('init ISSUE_TEMPLATE/guidance_request.md', () => {
        files['ISSUE_TEMPLATE/guidance_request.md'] = `---
name: Guidance Request
about: I don't know how to do something

---

- [ ] I have read the README and API docs (if applicable); the issue is not covered there.
- [ ] I have searched the repository issues and pull requests; my query is not covered there.

-----

- **Desired outcome**: XXXXX
- **My attempts**:
  - **On [stackblitz.com](https://stackblitz.com)** (preferred):
  - **Git repository** (*only* if a Stackblitz example is not possible):
  
-----

Additional information goes here.
`;
      });

      before('init test cases', () => {
        forEach(files, (contents, filename) => {
          const title = `Contents of .github/${filename} should match expected`;
          const fn = async () => {
            expect(await fs.readFile(`.github/${filename}`, 'utf8')).to.eq(contents);
          };
          this.addTest(new Test(title, fn));
        });
      });

      it('', noop);

      //tslint:enable:max-line-length
    });

    describe('Skip', () => {
      const files = [
        'CONTRIBUTING.md',
        'ISSUE_TEMPLATE.md',
        'PULL_REQUEST_TEMPLATE.md',
        'ISSUE_TEMPLATE/bug_report.md',
        'ISSUE_TEMPLATE/feature_request.md',
        'ISSUE_TEMPLATE/guidance_request.md'
      ];

      before('Set cwd', mkTmpDir);
      before('Run', () => run('--skip-gh-issue-tpl'));

      for (const f of files) {
        it(`.github/${f} should not exist`, async () => {
          expect(await exists(`.github/${f}`)).to.be.false;
        });
      }
    });
  });
});
