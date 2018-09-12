import * as fs from 'fs-extra';
import {dirname} from 'path';

function trim(s: string): string {
  return s.trim();
}

export class LineReadWriter {
  private readonly lines: string[];

  private constructor(contents?: string, private readonly file?: string) {
    this.lines = contents && (contents = contents.trim()) ? contents.split(/\n/g).map(trim) : [];
  }

  public static createFromContents(contents: string): LineReadWriter {
    return new LineReadWriter(contents);
  }

  public static createFromFile(filepath: string): LineReadWriter {
    try {
      return new LineReadWriter(fs.readFileSync(filepath, 'utf8'), filepath);
    } catch {
      return new LineReadWriter(undefined, filepath);
    }
  }

  public ensure(...lines: string[]): this {
    const toAdd = new Set<string>();
    for (const line of lines) {
      if (!this.lines.includes(line)) {
        toAdd.add(line);
      }
    }

    if (toAdd.size) {
      this.lines.push(...toAdd);
    }

    return this;
  }

  public ensureRegex(test: RegExp, line: string): this {
    for (const line$ of this.lines) {
      if (test.test(line$)) {
        return this;
      }
    }

    this.lines.push(line);

    return this;
  }

  public save(): this {
    if (!this.file) {
      throw new Error('File not provided');
    }

    this.mkdirp();
    fs.writeFileSync(this.file, this.toString());

    return this;
  }

  public toString(): string {
    return this.lines.join('\n') + '\n';
  }

  private mkdirp(): void {
    if (this.file) {
      try {
        fs.mkdirpSync(dirname(this.file));
      } catch {
        // noop
      }
    }
  }
}
