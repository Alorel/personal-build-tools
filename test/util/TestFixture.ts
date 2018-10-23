import * as Bluebird from 'bluebird';
import * as fs from 'fs-extra';
import {noop} from 'lodash';
import * as path from 'path';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {globAsync} from './globAsync';
import {tmpDir} from './tmp-test';

const FIXTURE_DIR = path.join(__dirname, '../fixtures');
const _outDir: unique symbol = Symbol('outDir');

export class TestFixture {
  private [_outDir]: string;

  public constructor(private readonly subdir: string, outDir?: string) {
    this[_outDir] = outDir || tmpDir();
  }

  @LazyGetter()
  private get dir(): string {
    return path.join(FIXTURE_DIR, this.subdir);
  }

  public emptyOutDir(dir: string = this.outDir()): Bluebird<void> {
    return this.mkdirp(dir)
      .then(() => fs.emptyDir(dir))
      .then(noop);
  }

  public existsOut(file: string): Bluebird<boolean> {
    return Bluebird.resolve(fs.pathExists(path.join(this.outDir(), file)));
  }

  public outDir(): string;

  public outDir(dir: string): this;

  public outDir(dir?: string): this | string {
    if (dir) {
      this[_outDir] = dir;

      return this;
    }

    return this[_outDir];
  }

  public outFiles(absolute = false): Bluebird<string[]> {
    return globAsync('**/*.*', {cwd: this.outDir(), absolute});
  }

  public readOut(file: string): Bluebird<string> {
    return Bluebird.resolve(fs.readFileSync(path.join(this.outDir(), file), 'utf8'));
  }

  public readOutAndParse<T = any>(file: string): Bluebird<T> {
    //tslint:disable-next-line:no-unbound-method
    return this.readOut(file).then<any>(JSON.parse);
  }

  public readSrc(file: string): Bluebird<string> {
    return Bluebird.resolve(fs.readFileSync(path.join(this.dir, file), 'utf8'));
  }

  public readSrcAndParse<T = any>(file: string): Bluebird<T> {
    //tslint:disable-next-line:no-unbound-method
    return this.readSrc(file).then<any>(JSON.parse);
  }

  public sourceFiles(absolute = true): Bluebird<string[]> {
    return globAsync('**/*.*', {cwd: this.dir, absolute});
  }

  public write(): Bluebird<void> {
    return Bluebird.all([this.sourceFiles(true), <any>this.emptyOutDir()])
      .spread<string[]>(sourceAbs => sourceAbs)
      .map<any>(sourceAbs => {
        const dirname = path.dirname(sourceAbs);
        const relative = path.relative(this.dir, sourceAbs);

        return this.mkdirp(dirname)
          .then(() => fs.copy(sourceAbs, path.join(this.outDir(), relative)));
      })
      .then(noop);
  }

  private mkdirp(dir: string = this.outDir()): Bluebird<void> {
    return Bluebird.resolve(fs.mkdirp(dir));
  }
}
