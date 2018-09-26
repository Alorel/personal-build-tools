import * as fs from 'fs-extra';
import {template} from 'lodash';
import {join} from 'path';
import {LazyGetter} from 'typescript-lazy-get-decorator';

const FIXTURE_DIR = join(__dirname, '..', 'fixtures');

interface Obj {
  [k: string]: any;
}

export class Fixture {
  public constructor(private readonly feature: string) {
  }

  @LazyGetter()
  private get srcDir(): string {
    return join(FIXTURE_DIR, this.feature);
  }

  public copy(from: string, to: string): void {
    fs.copySync(join(this.srcDir, from), to);
  }

  public read(from: string): Buffer {
    return fs.readFileSync(join(this.srcDir, from));
  }

  public template<T extends Obj>(from: string, tpl: T, to: string): void;
  public template<T extends Obj>(from: string, tpl: T): string;
  public template<T extends Obj>(from: string, tpl: T, to?: string): string | void {
    const compiled = template(this.read(from).toString());
    const formatted = compiled(tpl);

    if (to) {
      fs.writeFileSync(to, formatted);
    } else {
      return formatted;
    }
  }
}
