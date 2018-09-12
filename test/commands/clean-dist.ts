import * as Bluebird from 'bluebird';
import {expect} from 'chai';
import {noop} from 'lodash';
import {Test} from 'mocha';
import {alo} from '../../src/alo';
import {TestFixture} from '../util/TestFixture';

describe('clean-dist', () => {
  let fixture: TestFixture;
  let srcFiles: string[];

  function initFixture(): Bluebird<void> {
    fixture = new TestFixture('clean-dist');

    return fixture.write();
  }

  describe('fixtures', () => {
    let distFiles: string[];

    before('init fixtures', initFixture);

    it('should have source files', async () => {
      srcFiles = await fixture.sourceFiles(false);
      expect(srcFiles).to.not.be.empty;
    });

    it('should have dist files', async () => {
      distFiles = await fixture.outFiles(false);
      expect(distFiles).to.not.be.empty;
    });

    it('Should initially have same number of src/dist files', () => {
      expect(srcFiles.length).to.eq(distFiles.length);
    });
  });

  describe('cleaning', function () {
    let distFiles: string[];

    before('fixturise', initFixture);

    before('run', () => alo([
      'clean-dist',
      '--dist-dirs',
      fixture.outDir()
    ]));

    before('Get dist files', async () => {
      distFiles = await fixture.outFiles(false);
    });

    before('Make tests', () => {
      const shouldRemain = [
        'file-with-contents.js',
        'file-with-contents.js.map',
        'SomeInternalThing.js',
        'SomeInternalThing.js.map',
        'SomeRealThing.d.ts'
      ];
      for (const file of srcFiles) {
        if (shouldRemain.indexOf(file) === -1) {
          this.addTest(new Test(
            `${file} should be removed`,
            () => {
              expect(distFiles).to.not.include(file);
            }
          ));
        } else {
          this.addTest(new Test(
            `${file} should be kept`,
            () => {
              expect(distFiles).to.include(file);
            }
          ));
        }
      }
    });

    it('', noop);
  });
});
