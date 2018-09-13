import * as fs from 'fs-extra';
import {get, has, noop, PropertyPath, set} from 'lodash';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {AbstractReadWriter} from './AbstractReadWriter';

export const enum ObjectWriterFormat {
  JSON
}

interface Obj {
  [k: string]: any;
}

export class ObjectWriter<T extends Obj = Obj> extends AbstractReadWriter {
  private contents: T;

  public constructor(path: string, _format: ObjectWriterFormat) {
    super(path);
    this.read();
  }

  @LazyGetter()
  private get parseFn(): (v: string) => T {
    //tslint:disable-next-line:no-unbound-method
    return JSON.parse;
  }

  @LazyGetter()
  private get stringifyFn(): (v: T) => string {
    //tslint:disable-next-line:no-magic-numbers
    return (v: T) => JSON.stringify(v, null, 2);
  }

  public get(p: PropertyPath): any {
    return get(this.contents, p);
  }

  public has(p: PropertyPath): boolean {
    return has(this.contents, p);
  }

  public read(): this {
    noop(this.dirname);
    try {
      this.contents = this.parseFn(fs.readFileSync(this.file, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') {
        this.contents = <any>{};
      } else {
        throw e;
      }
    }

    return this;
  }

  public set(p: PropertyPath, v: any, override = true): this {
    if (override || !this.has(p)) {
      set(this.contents, p, v);
    }

    return this;
  }

  public toString(): string {
    return this.stringifyFn(this.contents) + '\n';
  }
}
