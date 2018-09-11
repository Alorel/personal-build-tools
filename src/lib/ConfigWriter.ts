import * as fs from 'fs';
import {cloneDeep, isEmpty, merge, set} from 'lodash';
import {homedir} from 'os';
import {join} from 'path';
import * as YAML from 'yamljs';
import {defaultCfgName} from '../inc/defaultCfgName';

export class ConfigWriter {

  public static readonly filepath: string = join(homedir(), defaultCfgName);

  private data: { global?: { [k: string]: any }; [k: string]: any };

  public constructor() {
    this.refresh();
  }

  public refresh(): this {
    try {
      const contents = fs.readFileSync(ConfigWriter.filepath, 'utf8');
      const parsed = YAML.parse(contents);
      this.data = isEmpty(parsed) ? {} : parsed;

      return this;
    } catch {
      this.data = {};

      return this;
    }
  }

  public save(): this {
    const d = cloneDeep(this.data);
    this.refresh();
    merge(this.data, d);

    return this.write();
  }

  public set(key: string, value: any, scope = 'global'): this {
    set(this.data, [scope, key], value);

    return this;
  }

  private write(): this {
    //tslint:disable-next-line:no-magic-numbers
    fs.writeFileSync(ConfigWriter.filepath, YAML.stringify(this.data, Number.MAX_VALUE, 2));

    return this;
  }
}
