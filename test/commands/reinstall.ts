import * as Bluebird from 'bluebird';
import {expect} from 'chai';
import {forEach, noop} from 'lodash';
import {alo} from '../../src/alo';
import {TestFixture} from '../util/TestFixture';

describe('reinstall', function () {
  let fixture: TestFixture;
  let npmLockContents: string;
  let yarnLockContents: string;
  let pkgJsonContents: string;

  function initFixture(): Bluebird<void> {
    fixture = new TestFixture('reinstall');

    return fixture.write();
  }

  function readContents(): Bluebird<void> {
    return Bluebird
      .all([
        fixture.readOut('package-lock.json').then(c => {
          npmLockContents = c;
        }),
        fixture.readOut('yarn.lock').then(c => {
          yarnLockContents = c;
        }),
        fixture.readOut('node_modules/@alorel-personal/empty-pkg/package.json').then(c => {
          pkgJsonContents = c;
        })
      ])
      .then(noop);
  }

  // should inc version in node_modules, package-lock, yarn-lock
  type KeepSpec = [boolean, boolean, boolean];

  interface Suite {
    npm: KeepSpec;

    yarn: KeepSpec;
  }

  interface Suites {
    [k: string]: Suite;
  }

  const suites: Suites = {
    'Don\'t keep the lockfile': {
      npm: [true, true, false],
      yarn: [true, false, true]
    },
    'Keep the lockfile': {
      npm: [false, false, false],
      yarn: [false, false, false]
    }
  };

  forEach(suites, (suiteSpec: Suite, suiteName: string) => {
    describe(suiteName, () => {
      forEach(suiteSpec, (keepSpec: KeepSpec, pkgMgr: string) => {
        const [nodeModules, pkgLock, yarnLock] = keepSpec;

        describe(pkgMgr, () => {
          before('Init fixture', initFixture);
          before('run', () => {
            const args = [
              'reinstall',
              '--cwd',
              fixture.outDir()
            ];
            if (!suiteName.includes('Don\'t')) {
              args.push('--keep');
            }
            args.push(pkgMgr);

            return alo(args);
          });
          before('Read contents', readContents);

          it(`node_modules ${nodeModules ? 'should' : 'shouldn\'t'} have an incremented version`, () => {
            expect(pkgJsonContents).to.include(nodeModules ? '1.1.0' : '1.0.0');
          });

          it(`package-lock.json ${pkgLock ? 'should' : 'shouldn\'t'} have an incremented version`, () => {
            expect(npmLockContents).to.include(pkgLock ? '1.1.0' : '1.0.0');
          });

          it(`yarn.lock ${yarnLock ? 'should' : 'shouldn\'t'} have an incremented version`, () => {
            expect(yarnLockContents).to.include(yarnLock ? '1.1.0' : '1.0.0');
          });
        });
      });
    });
  });
});
