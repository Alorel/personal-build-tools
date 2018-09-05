import * as Bluebird from 'bluebird';
import {expect} from 'chai';
import * as _ from 'lodash';
import {join} from 'path';
import {alo} from '../../src/alo';
import {Fixture} from '../util/Fixture';

//tslint:disable:object-literal-sort-keys

describe('clean-pkg-json', () => {
  let fixture: Fixture;
  let srcFiles: string[];
  let outContent: any;
  const fpath = join('subdir', 'package.json');

  function initFixture(): Bluebird<void> {
    fixture = new Fixture('clean-pkg-json');

    return fixture.write();
  }

  function run(...args: string[]): Promise<string> {
    return alo(['clean-pkg-json'].concat(args));
  }

  describe('fixtures', () => {
    let distFiles: string[];

    before('init fixture', initFixture);

    it('should have source files', async () => {
      srcFiles = await fixture.sourceFiles(false);
      expect(srcFiles).to.deep.eq([fpath]);
    });

    it('should have dist files', async () => {
      distFiles = await fixture.outFiles(false);
      expect(distFiles).to.deep.eq([fpath]);
    });
  });

  describe('cleaning: sort-scripts', () => {
    before('init fixture', initFixture);
    before('run', () => run('--sort-scripts', '--dist-dirs', fixture.outDir()));
    before('read', async () => {
      outContent = await fixture.readOutAndParse(fpath);
    });

    it('Should match json', () => {
      expect(outContent).to.deep.eq({
        scripts: {
          prestop: 'qux',
          postinstall: 'foo'
        },
        peerDependencies: {
          qux: '3',
          foo: '2',
          bar: '1'
        }
      });
    });

    it('Should be sorted', () => {
      const scripts = {postinstall: 'foo', prestop: 'qux'};
      const peerDependencies = {bar: '1', foo: '2', qux: '3'};
      const exp = JSON.stringify({scripts, peerDependencies});
      const exist = JSON.stringify(outContent);

      expect(exist).to.eq(exp);
    });
  });

  describe('cleaning: skip-clean-scripts', () => {
    before('init fixture', initFixture);
    before('run', () => run('--skip-clean-scripts', '--dist-dirs', fixture.outDir()));
    before('read', async () => {
      outContent = await fixture.readOutAndParse(fpath);
    });

    it('Should match json', () => {
      expect(outContent.scripts).to.deep.eq({
        prestop: 'qux',
        custom: 'bar',
        postinstall: 'foo'
      });
    });
  });

  describe('cleaning: skip-remove-fields', () => {
    let srcContents: any;
    before('init fixture', initFixture);
    before('run', () => {
      const args = [
        '--skip-remove-fields',
        '--skip-clean-scripts',
        '--skip-sort-deps',
        '--dist-dirs',
        fixture.outDir()
      ];

      return run(...args);
    });
    before('read', async () => {
      const outContent$ = fixture.readOutAndParse(fpath);
      const srcContent$ = fixture.readSrcAndParse(fpath);
      srcContents = await srcContent$;
      outContent = await outContent$;
    });

    it('Should match json', () => {
      expect(outContent).to.deep.eq(_.omit(srcContents, ['dependencies', 'devDependencies']));
    });
  });
});
