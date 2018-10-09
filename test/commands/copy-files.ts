import {expect} from 'chai';
import * as fs from 'fs';
import * as JSON5 from 'json5';
import {join} from 'path';
import * as YAML from 'yamljs';
import {alo} from '../../src/alo';
import {tmpDir, tmpFile} from '../util/tmp-test';

describe('copy-files', () => {
  describe('With CLI args', () => {
    const enum Variant {
      ONE_ONE = 'One source one destination',
      MULTI_ONE = 'Multiple sources one destination',
      MULTI_MULTI = 'Multple sources multiple destinations'
    }

    for (const variant of [Variant.ONE_ONE, Variant.MULTI_ONE, Variant.MULTI_MULTI]) {
      describe(variant, () => {
        let srcDir: string;
        let destDir: string;
        let fileList: string[];

        before(() => {
          srcDir = tmpDir();
          destDir = tmpDir();
        });

        before('create dummy files', () => {
          ['foo.yml', 'bar.yaml', 'foo.md']
            .map(p => join(srcDir, p))
            .forEach(p => fs.writeFileSync(p, '.'));
        });

        before('run', () => {
          const args: any[] = ['copy-files', '--from'];
          if (variant === Variant.ONE_ONE) {
            args.push(join(srcDir, '*.{yml,yaml}'), '--to', destDir);
          } else if (variant === Variant.MULTI_ONE) {
            args.push(join(srcDir, '*.yml'), join(srcDir, '*.yaml'), '--to', destDir);
          } else {
            args.push(join(srcDir, '*.yml'), join(srcDir, '*.yaml'), '--to', destDir, destDir);
          }

          return alo(args);
        });

        before('get file list', () => {
          fileList = fs.readdirSync(destDir, 'utf8');
        });

        it('should have foo.yml', () => {
          expect(fileList).to.contain('foo.yml');
        });

        it('should have bar.yaml', () => {
          expect(fileList).to.contain('bar.yaml');
        });

        it('Should not have foo.md', () => {
          expect(fileList).to.not.contain('foo.md');
        });

        for (const f of ['foo.yml', 'bar.yaml']) {
          it(`Should have ${f}`, () => {
            expect(fileList).to.contain(f);
          });
          it(`Contents of ${f} should be "."`, () => {
            const c = fs.readFileSync(join(destDir, f), 'utf8');
            expect(c).to.eq('.');
          });
        }
      });
    }
  });

  for (const format of ['.js', '.json', '.json5', '.yml', '.yaml']) {
    describe(`With config file in ${format} format`, () => {
      let srcDir: string;
      let destDir: string;
      let cfgFile: string;
      let fileList: string[];

      before(() => {
        srcDir = tmpDir();
        destDir = tmpDir();
        cfgFile = tmpFile(format);
      });

      before('create dummy files', () => {
        ['foo.yml', 'bar.yaml', 'foo.md']
          .map(p => join(srcDir, p))
          .forEach(p => fs.writeFileSync(p, '.'));
      });

      before('init config file', () => {
        let contents: string;
        const cfg = {
          'copy-files': {
            to: destDir
          },
          global: {
            from: join(srcDir, '*.{yml,yaml}')
          }
        };

        switch (format) {
          case '.js':
            contents = `module.exports = ${JSON5.stringify(cfg)}`;
            break;
          case '.json':
            contents = JSON.stringify(cfg);
            break;
          case '.json5':
            contents = JSON5.stringify(cfg);
            break;
          case '.yml':
          case '.yaml':
            //tslint:disable-next-line:no-magic-numbers
            contents = YAML.stringify(cfg, Number.MAX_VALUE, 2);
            break;
          default:
            throw new Error('Test error: invalid format');
        }

        fs.writeFileSync(cfgFile, contents);
      });

      before('run', () => {
        return alo(['copy-files', '-c', cfgFile]);
      });

      before('get file list', () => {
        fileList = fs.readdirSync(destDir, 'utf8');
      });

      it('should have foo.yml', () => {
        expect(fileList).to.contain('foo.yml');
      });

      it('should have bar.yaml', () => {
        expect(fileList).to.contain('bar.yaml');
      });

      it('Should not have foo.md', () => {
        expect(fileList).to.not.contain('foo.md');
      });

      for (const f of ['foo.yml', 'bar.yaml']) {
        it(`Should have ${f}`, () => {
          expect(fileList).to.contain(f);
        });
        it(`Contents of ${f} should be "."`, () => {
          const c = fs.readFileSync(join(destDir, f), 'utf8');
          expect(c).to.eq('.');
        });
      }
    });
  }
});
