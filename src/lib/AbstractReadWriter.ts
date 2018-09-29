import * as fs from 'fs-extra';
import {noop} from 'lodash';
import {dirname} from 'path';
import {LazyGetter} from 'typescript-lazy-get-decorator';

export abstract class AbstractReadWriter {
  protected readonly file: string;

  public constructor(filepath?: string) {
    this.file = <string>filepath;
  }

  @LazyGetter()
  protected get dirname(): string {
    if (this.file) {
      return dirname(this.file);
    } else {
      throw new Error('Unable to get dirname: file not set');
    }
  }

  public save(): this {
    this.mkdirp();
    fs.writeFileSync(this.file, this.toString());

    return this;
  }

  public abstract toString(): string;

  private mkdirp(): void {
    noop(this.dirname);
    try {
      fs.mkdirpSync(this.dirname);
    } catch {
      // noop
    }
  }
}
