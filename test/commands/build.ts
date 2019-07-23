import {expect} from 'chai';
import {forEach, noop, pull} from 'lodash';
import {Test} from 'mocha';
import {alo} from '../../src/alo';
import {BuildTarget} from '../../src/interfaces/BuildTarget';
import {Nil} from '../../src/interfaces/Nil';
import {Obj} from '../../src/interfaces/OptionsObject';
import {TestFixture} from '../util/TestFixture';

const enum Const {
  TIMEOUT = 30000,
  NAME = 'build',
  UMD_NAME = 'BuildTest',
  PKG_NAME = 'build-test'
}

describe(Const.NAME, function () {
  let fixture: TestFixture;
  this.timeout(Const.TIMEOUT);

  async function copyFixture() {
    fixture = new TestFixture(Const.NAME);

    await fixture.write();
    process.chdir(fixture.outDir());
  }

  let initialDir: string;

  const baseArgs: string[] = [
    'build',
    '--entry',
    'src/index.ts',
    '--externals',
    'tslib',
    '--license-banner',
    '--out',
    'dist',
    '--tsconfig',
    'tsconfig.json',
    '--umd-name',
    <string>Const.UMD_NAME
  ];

  before('set initial dir', () => {
    initialDir = process.cwd();
  });

  after('reset initial dir', () => {
    if (initialDir) {
      process.chdir(initialDir);
    }
  });

  let files = [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/index.js.map',
    'dist/loopy.js',
    'dist/loopy.d.ts',
    'dist/loopy.js.map',
    'dist/_bundle/fesm5.js',
    'dist/_bundle/fesm5.js.map',
    'dist/_bundle/fesm2015.js',
    'dist/_bundle/fesm2015.js.map',
    'dist/_bundle/umd.js',
    'dist/_bundle/umd.min.js',
    'dist/_bundle/umd.js.map',
    'dist/_bundle/esm5/index.js',
    'dist/_bundle/esm5/index.js.map',
    'dist/_bundle/esm5/loopy.js',
    'dist/_bundle/esm5/loopy.js.map',
    'dist/_bundle/esm2015/index.js',
    'dist/_bundle/esm2015/index.js.map',
    'dist/_bundle/esm2015/loopy.js',
    'dist/_bundle/esm2015/loopy.js.map'
  ];
  let noExist: string[] = [];

  let shouldHaveBanner = [
    'dist/_bundle/fesm2015.js',
    'dist/_bundle/fesm5.js',
    'dist/_bundle/umd.js',
    'dist/_bundle/umd.min.js'
  ];

  let shouldImportTslib = [
    'dist/_bundle/fesm5.js',
    'dist/_bundle/esm5/loopy.js'
  ];

  let pkgJson: Obj<string>;
  let pkgJsonExpect: Obj<string | Nil> = {
    browser: '_bundle/umd.js',
    esm2015: '_bundle/esm2015/index.js',
    esm5: '_bundle/esm5/index.js',
    fesm2015: '_bundle/fesm2015.js',
    fesm5: '_bundle/fesm5.js',
    jsdelivr: '_bundle/umd.min.js',
    main: 'index.js',
    module: '_bundle/fesm5.js',
    types: 'index.d.ts',
    typings: 'index.d.ts'
  };

  function generateFullTest(args: string | string[]): void {
    before('fixtures', copyFixture);
    before('run', () => alo(args));

    for (const file of files) {
      it(`${file} should exist`, async () => {
        expect(await fixture.existsOut(file)).to.be.true;
      });
      const banner = shouldHaveBanner.includes(file);

      it(`${file} ${banner ? 'should' : 'shouldn\'t'} have the license banner`, async () => {
        const contents = await fixture.readOut(file);
        let exp = expect(contents).to;
        if (!banner) {
          exp = exp.not;
        }
        exp.include('Big scary license block');
      });
    }

    for (const file of shouldImportTslib) {
      it(`${file} should import tslib`, async () => {
        const contents = await fixture.readOut(file);
        expect(contents).to.match(/['"]tslib['"]/i);
      });
    }

    it('UMD bundle should inline tslib', async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include('function __values');
    });

    it(`UMD bundle should have ${Const.PKG_NAME} as the package name`, async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include(`define('${Const.PKG_NAME}',`);
    });

    it(`UMD bundle should have ${Const.UMD_NAME} as the global name`, async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include(`global.${Const.UMD_NAME} = `);
    });
  }

  describe('Full', () => {
    generateFullTest(baseArgs);

    describe('package.json', function () {
      before('Read package.json', async () => {
        pkgJson = await fixture.readOutAndParse('package.json');
      });
      before('Generate tests', () => {
        forEach(pkgJsonExpect, (value, key) => {
          let title: string;
          let fn: any;

          if (value) {
            title = `Should have ${key} set to ${value}`;
            fn = () => {
              expect(pkgJson[key]).to.eq(value);
            };
          } else {
            title = `Shouldn't have ${key}`;
            fn = () => {
              expect(pkgJson[key]).to.be.undefined;
            };
          }
          this.addTest(new Test(title, fn));
        });
      });

      it('', noop);
    });
  });

  describe('Skip package fields', () => {
    generateFullTest([...baseArgs, '--skip-package-fields']);

    describe('package.json', function () {
      before('Read package.json', async () => {
        pkgJson = await fixture.readOutAndParse('package.json');
      });

      before('Generate tests', () => {
        for (const field of Object.keys(pkgJsonExpect)) {
          this.addTest(new Test(`Shouldn't have ${field}`, () => {
            expect(pkgJson[field]).to.be.undefined;
          }));
        }
      });

      it('', noop);
    });
  });

  describe('No license banner', () => {
    before('exclude license banner from params', () => {
      pull(baseArgs, '--license-banner');
      shouldHaveBanner = [];
    });
    before('fixtures', copyFixture);
    before('run', () => alo(baseArgs));

    for (const file of files) {
      it(`${file} should exist`, async () => {
        expect(await fixture.existsOut(file)).to.be.true;
      });

      it(`${file} shouldn't have the license banner`, async () => {
        const contents = await fixture.readOut(file);
        expect(contents).to.not.include('Big scary license block');
      });
    }

    for (const file of shouldImportTslib) {
      it(`${file} should import tslib`, async () => {
        const contents = await fixture.readOut(file);
        expect(contents).to.match(/['"]tslib['"]/i);
      });
    }

    it('UMD bundle should inline tslib', async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include('function __values');
    });

    it(`UMD bundle should have ${Const.PKG_NAME} as the package name`, async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include(`define('${Const.PKG_NAME}',`);
    });

    it(`UMD bundle should have ${Const.UMD_NAME} as the global name`, async () => {
      const contents = await fixture.readOut('dist/_bundle/umd.js');
      expect(contents).to.include(`global.${Const.UMD_NAME} = `);
    });

    describe('package.json', function () {
      before('Read package.json', async () => {
        pkgJson = await fixture.readOutAndParse('package.json');
      });
      before('Generate tests', () => {
        forEach(pkgJsonExpect, (value, key) => {
          let title: string;
          let fn: any;

          if (value) {
            title = `Should have ${key} set to ${value}`;
            fn = () => {
              expect(pkgJson[key]).to.eq(value);
            };
          } else {
            title = `Shouldn't have ${key}`;
            fn = () => {
              expect(pkgJson[key]).to.be.undefined;
            };
          }
          this.addTest(new Test(title, fn));
        });
      });

      it('', noop);
    });
  });

  describe('Exclusions', () => {
    before('Add all package types', () => {
      baseArgs.push(
        '--targets',
        BuildTarget.DECLARATION,
        BuildTarget.CJS,
        BuildTarget.ESM5,
        BuildTarget.ESM2015,
        BuildTarget.FESM5,
        BuildTarget.FESM2015,
        BuildTarget.UMD
      );
    });

    describe('No UMD', () => {
      before('remove from args', () => {
        baseArgs.pop();
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/_bundle/umd.js',
          'dist/_bundle/umd.min.js',
          'dist/_bundle/umd.js.map'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.browser = null;
        pkgJsonExpect.jsdelivr = null;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });

    describe('No FESM2015', () => {
      before('remove from args', () => {
        baseArgs.pop();
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/_bundle/fesm2015.js',
          'dist/_bundle/fesm2015.js.map'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.fesm2015 = null;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });

    describe('No FESM5', () => {
      before('remove from args', () => {
        baseArgs.pop();
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/_bundle/fesm5.js',
          'dist/_bundle/fesm5.js.map'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.fesm5 = null;
        pkgJsonExpect.module = pkgJsonExpect.esm5;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });

    describe('No Declaration', () => {
      before('remove from args', () => {
        pull(baseArgs, BuildTarget.DECLARATION);
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/index.d.ts',
          'dist/loopy.d.ts'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.types = null;
        pkgJsonExpect.typings = null;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });

    describe('No ESM2015', () => {
      before('remove from args', () => {
        baseArgs.pop();
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/_bundle/esm2015/index.js',
          'dist/_bundle/esm2015/index.js.map'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.esm2015 = null;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });

    describe('No ESM5', () => {
      before('remove from args', () => {
        baseArgs.pop();
      });
      before('fixtures', copyFixture);
      before('Modify file list', () => {
        const pulled = [
          'dist/_bundle/esm5/index.js',
          'dist/_bundle/esm5/index.js.map'
        ];
        pull(files, ...pulled);
        noExist.push(...pulled);
        pkgJsonExpect.esm5 = null;
        pkgJsonExpect.module = null;

        for (const f of files) {
          this.addTest(new Test(`${f} should exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.true;
          }));
        }
        for (const f of noExist) {
          this.addTest(new Test(`${f} shouldn't exist`, async () => {
            expect(await fixture.existsOut(f)).to.be.false;
          }));
        }
      });
      before('run', () => alo(baseArgs));

      it('', noop);

      describe('package.json', function () {
        before('Read package.json', async () => {
          pkgJson = await fixture.readOutAndParse('package.json');
        });
        before('Generate tests', () => {
          forEach(pkgJsonExpect, (value, key) => {
            let title: string;
            let fn: any;

            if (value) {
              title = `Should have ${key} set to ${value}`;
              fn = () => {
                expect(pkgJson[key]).to.eq(value);
              };
            } else {
              title = `Shouldn't have ${key}`;
              fn = () => {
                expect(pkgJson[key]).to.be.undefined;
              };
            }
            this.addTest(new Test(title, fn));
          });
        });

        it('', noop);
      });
    });
  });
});
