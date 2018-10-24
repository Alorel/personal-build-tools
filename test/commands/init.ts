import {expect} from 'chai';
import * as fs from 'fs-extra';
import {castArray, forEach, isObjectLike, merge, noop, template, uniq} from 'lodash';
import {Test} from 'mocha';
import {join} from 'path';
import * as YAML from 'yamljs';
import {alo} from '../../src/alo';
import {TRAVIS_NODE_VERSIONS} from '../../src/const/TRAVIS_NODE_VERSIONS';
import {LICENSE_VALUES} from '../../src/inc/License';
import {Fixture} from '../../src/lib/Fixture';
import {tmpDir} from '../util/tmp-test';

//tslint:disable:no-magic-numbers

interface TestSpec {
  expect: any;

  file: string;

  skipFlags?: string | string[];
}

describe('init', function () {
  this.timeout(60 * 1000);

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
    '--pkg-mgr',
    'yarn',
    '--project-keywords',
    'test-keyword1',
    'test-keyword2',
    '--project-desc',
    'test-desc',
    '--gh-user',
    'Alorel',
    '--project-name',
    'test-project-name',
    '--skip-license',
    '--gh-repo',
    'personal-build-tools',
    '--skip-travis-release'
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
        '/.alobuild-tsconfig-*.json',
        'package-lock.json',
        ''
      ].join('\n'),
      file: '.gitignore',
      skipFlags: '--skip-gitignore'
    },
    {
      expect: `global:
  dist-dirs: &distDirs dist
  tsconfig: tsconfig.json

clean-pkg-json:
  sort-scripts: true

copy-files:
  from:
  - package.json
  - LICENSE
  - CHANGELOG.md
  - README.md
  to: *distDirs

build:
  entry: src/index.ts
  license-banner: true
  out: *distDirs
  umd-name: MyLib
  externals: tslib
`,
      file: '.alobuild.yml'
    },
    {
      expect: `branch: master
tagFormat: '\${version}'

verifyConditions:
- path: &npm '@semantic-release/npm'
  pkgRoot: '.'
- &gh '@semantic-release/github'

prepare:
- '@semantic-release/changelog'
- '@alorel-personal/semantic-release'
- *npm
- path: &exec '@semantic-release/exec'
  cmd: yarn run doctoc
- path: *exec
  cmd: alo copy-files
- path: *exec
  cmd: alo clean-dist
- path: *exec
  cmd: alo clean-pkg-json
- path: '@semantic-release/git'
  message: 'chore(release): \${nextRelease.version}'
  assets:
  - CHANGELOG.md
  - README.md
  - package.json
  - yarn.lock

publish:
- path: *npm
  pkgRoot: './dist'
- *gh

generateNotes:
  config: '@alorel-personal/conventional-changelog-alorel'
`,
      file: '.releaserc.yml'
    },
    {
      expect: JSON.stringify(
        {
          extends: './node_modules/@alorel-personal/tslint-rules/tslint.json'
        },
        null,
        2
      ) + '\n',
      file: 'tslint.json'
    },
    {
      expect: JSON.stringify(
        {
          compilerOptions: {
            module: 'commonjs',
            target: 'es5',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            newLine: 'lf',
            noFallthroughCasesInSwitch: true,
            suppressImplicitAnyIndexErrors: true,
            importHelpers: true,
            allowUnreachableCode: false,
            allowUnusedLabels: false,
            strict: true,
            stripInternal: true,
            declaration: false,
            noImplicitAny: true,
            strictNullChecks: true,
            strictPropertyInitialization: false,
            removeComments: false,
            moduleResolution: 'node',
            sourceMap: true,
            outDir: 'dist'
          },
          include: [
            'src'
          ],
          exclude: [
            'node_modules'
          ]
        },
        null,
        2
      ) + '\n',
      file: 'tsconfig.json'
    },
    {
      expect: JSON.stringify(
        {
          extends: './tsconfig.json',
          compilerOptions: {
            target: 'es6'
          },
          include: [
            'src',
            'test'
          ]
        },
        null,
        2
      ) + '\n',
      file: 'tsconfig.test.json'
    },
    {
      expect: [
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
      ].join('\n') + '\n',
      file: 'mocha.opts'
    },
    {
      expect: [
        'import {expect} from \'chai\';',
        '',
        'describe(\'Stub test suite\', function () {',
        '  it(\'Stub test\', () => {',
        '    console.log(\'I pass!\');',
        '  });',
        '});'
      ].join('\n') + '\n',
      file: 'test/stub.ts'
    },
    {
      expect: JSON.stringify(
        //tslint:disable:object-literal-sort-keys no-magic-numbers
        {
          reporter: [
            'text',
            'text-summary',
            'html',
            'lcov'
          ],
          extension: [
            '.ts'
          ],
          require: [
            'ts-node/register'
          ],
          exclude: [
            '**/test/**/*',
            '**/webpack.config.js',
            '**/rollup.config.js'
          ],
          sourceMap: true,
          instrument: true
        },
        null,
        2
      ) + '\n',
      //tslint:enable:object-literal-sort-keys no-magic-numbers
      file: '.nycrc'
    },
    {
      expect: '// stub\n',
      file: 'src/index.ts'
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

  describe('dependencies', () => {
    let devDeps: string[];
    let peerDeps: string[];
    let deps: any;

    const baseDevDeps = uniq([
      '@alorel-personal/build-tools',
      '@alorel-personal/conventional-changelog-alorel',
      '@alorel-personal/semantic-release',
      '@alorel-personal/tslint-rules',
      '@semantic-release/changelog',
      '@semantic-release/exec',
      '@semantic-release/git',
      '@semantic-release/npm',
      '@types/node',
      'mocha',
      'source-map-support',
      '@types/mocha',
      'chai',
      '@types/chai',
      'semantic-release',
      'coveralls',
      'nyc',
      'rimraf',
      'tslib',
      'ts-node',
      'typescript'
    ]).sort();

    before('Set cwd', mkTmpDir);
    before('Run', runBase);
    before('read', async () => {
      const contents = JSON.parse(await read('package.json'));
      devDeps = Object.keys(contents.devDependencies).sort();
      peerDeps = Object.keys(contents.peerDependencies).sort();
      deps = contents.dependencies;
    });
    it('tslib should be the only peer dependency', () => {
      expect(peerDeps).to.deep.eq(['tslib']);
    });

    it('there should be no dependencies', () => {
      expect(deps).to.be.undefined;
    });

    it('Should have all the dependencies', () => {
      expect(devDeps).to.deep.eq(baseDevDeps);
    });
  });

  describe('.travis.yml', () => {
    //tslint:disable:object-literal-sort-keys
    let contents: { [k: string]: any };
    const prepKey = 'if [[ $GH_TOKEN ]]; then ./.alobuild-prep-release.sh; fi;';

    function withPkgMgrNpm(args: string[] = baseArgs): string[] {
      const copy = args.slice(0);
      const startIdx = copy.indexOf('--pkg-mgr') + 1;
      copy.splice(startIdx, 1, 'npm');

      return copy;
    }

    function npmBase(overrides: any = {}): any {
      return merge(
        {
          language: 'node_js',
          sudo: false,
          node_js: TRAVIS_NODE_VERSIONS,
          before_install: [
            'npm i -g greenkeeper-lockfile',
            prepKey,
            'greenkeeper-lockfile-update'
          ],
          install: 'npm install',
          script: [
            'npm run tslint',
            'npm run typecheck',
            'npm test -- --forbid-only --forbid-pending'
          ],
          after_script: 'if [[ $GH_TOKEN ]]; then greenkeeper-lockfile-upload; fi;',
          after_success: 'cat ./coverage/lcov.info | coveralls',
          cache: {
            directories: [
              './node_modules'
            ]
          }
        },
        overrides
      );
    }

    function yarnBase(overrides: any = {}): any {
      return merge(
        {
          language: 'node_js',
          sudo: false,
          node_js: TRAVIS_NODE_VERSIONS,
          before_install: [
            'npm i -g yarn greenkeeper-lockfile',
            prepKey,
            'greenkeeper-lockfile-update'
          ],
          install: 'yarn install --check-files',
          script: [
            'yarn run tslint',
            'yarn run typecheck',
            'yarn test --forbid-only --forbid-pending'
          ],
          after_script: 'if [[ $GH_TOKEN ]]; then greenkeeper-lockfile-upload; fi;',
          after_success: 'cat ./coverage/lcov.info | coveralls',
          cache: {
            yarn: true
          }
        },
        overrides
      );
    }

    describe('skip release', () => {
      before('Set release skip env var', () => {
        process.env.TEST_SKIP_TRAVIS_RELEASE = '1';
      });
      after('Rm release skip env var', () => {
        delete process.env.TEST_SKIP_TRAVIS_RELEASE;
      });

      describe('yarn', () => {
        before('Set cwd', mkTmpDir);
        before('run', runBase);
        before('read', async () => {
          contents = YAML.parse(await fs.readFile('.travis.yml', 'utf8'));
        });

        it('Contents should match expected', () => {
          expect(contents).to.deep.eq(yarnBase());
        });
      });

      describe('npm', () => {
        before('Set cwd', mkTmpDir);
        before('run', () => alo(withPkgMgrNpm()));
        before('read', async () => {
          contents = YAML.parse(await fs.readFile('.travis.yml', 'utf8'));
        });

        it('Contents should match expected', () => {
          expect(contents).to.deep.eq(npmBase());
        });
      });
    });

    describe('Don\'t skip release', () => {
      describe('yarn', () => {
        before('Set cwd', mkTmpDir);
        before('run', runBase);
        before('read', async () => {
          contents = YAML.parse(await fs.readFile('.travis.yml', 'utf8'));
        });

        it('Contents should match expected', () => {
          expect(contents).to.deep.eq(yarnBase({
            stages: [
              'Test',
              {
                name: 'Release',
                if: 'branch = master AND type = push AND (NOT tag IS present)'
              }
            ],
            jobs: {
              include: [{
                stage: 'Release',
                node_js: 'stable',
                before_install: [
                  'npm i -g yarn',
                  prepKey
                ],
                before_script: [
                  'yarn run build',
                  'alo copy-files'
                ],
                script: 'semantic-release',
                after_success: [],
                after_script: []
              }]
            }
          }));
        });
      });
      describe('npm', () => {
        before('Set cwd', mkTmpDir);
        before('run', () => alo(withPkgMgrNpm()));
        before('read', async () => {
          contents = YAML.parse(await fs.readFile('.travis.yml', 'utf8'));
        });

        it('Contents should match expected', () => {
          expect(contents).to.deep.eq(npmBase({
            stages: [
              'Test',
              {
                name: 'Release',
                if: 'branch = master AND type = push AND (NOT tag IS present)'
              }
            ],
            jobs: {
              include: [{
                stage: 'Release',
                node_js: 'stable',
                before_install: [
                  prepKey
                ],
                before_script: [
                  'npm run build',
                  'alo copy-files'
                ],
                script: 'semantic-release',
                after_success: [],
                after_script: []
              }]
            }
          }));
        });
      });
    });

    //tslint:enable:object-literal-sort-keys
  });

  describe('Licenses', () => {
    let fxt: Fixture;

    before('init fixture', () => {
      fxt = new Fixture('init/license');
    });

    for (const license of LICENSE_VALUES) {
      describe(license, () => {
        let expected: string;

        before('Set cwd', mkTmpDir);
        before('Run', () => {
          const args = baseArgs.filter(a => a !== '--skip-license')
            .concat('--license', license);

          return alo(args);
        });
        before('set expected', () => {
          const compiled = template(fxt.read(`${license}.txt`).toString().trim());
          expected = compiled({
            email: 'foo@bar.com',
            ghRepo: 'personal-build-tools',
            name: 'foo',
            url: 'https://foo.com',
            year: new Date().getFullYear()
          });
        });

        it('', async () => {
          expect((await read('LICENSE')).trim()).to.eq(expected);
        });
      });
    }

    describe('Skip', () => {
      before('Set cwd', mkTmpDir);
      before('Run', runBase);

      it('LICENSE should not exist', async () => {
        expect(await exists('LICENSE')).to.be.false;
      });
    });
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

      if (s.skipFlags) {
        describe('Skip', () => {
          before('Set cwd', mkTmpDir);
          before('Run', () => run(...castArray(s.skipFlags)));

          it(`${s.file} should not exist`, async () => {
            expect(await exists(s.file)).to.be.false;
          });
        });
      }
    });
  }

  describe('pkg json defaults', () => {
    const topExpect = {
      name: 'test-project-name',
      version: '0.0.1',
      description: 'test-desc',
      keywords: ['test-keyword1', 'test-keyword2']
    };

    const scriptsExpect = {
      pretest: 'rimraf coverage',
      test: 'nyc mocha --opts ./mocha.opts',
      'test:watch': 'npm run test -- --watch',
      tslint: 'alo tslint -p tsconfig.test.json',
      'tslint:fix': 'npm run tslint -- --fix',
      prebuild: 'rimraf dist',
      build: 'alo build',
      typecheck: 'tsc --noEmit',
      'typecheck:watch': 'npm run typecheck -- --watch'
    };

    let pjson: { [k: string]: any };

    before('Set cwd', mkTmpDir);
    before('Run', runBase);
    before('read', async () => {
      pjson = JSON.parse(await read('package.json'));
    });
    forEach(topExpect, (expected, key) => {
      it(key, () => {
        let xp: any = expect(pjson[key]).to;
        if (isObjectLike(expected)) {
          xp = xp.deep;
        }
        xp.eq(expected);
      });
    });
    describe('scripts', () => {
      forEach(scriptsExpect, (expected, key) => {
        it(key, () => {
          expect(pjson.scripts[key]).to.eq(expected);
        });
      });
      it('build', () => {
        expect(pjson.scripts.build).to.eq('alo build');
      });
    });
  });

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
