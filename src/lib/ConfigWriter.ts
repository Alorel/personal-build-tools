import * as fs from 'fs';
import {cloneDeep, isEmpty, merge, set, unset} from 'lodash';
import {homedir} from 'os';
import {join} from 'path';
import * as YAML from 'yamljs';
import {defaultCfgName} from '../const/defaultCfgName';

const enum Conf {
  DEFAULT_SCOPE = 'global'
}

export class ConfigWriter {

  public static readonly filepath: string = join(homedir(), defaultCfgName);

  private data: { global?: { [k: string]: any }; [k: string]: any };

  public constructor() {
    this.refresh();
  }

  /** This will automatically save */
  public clear(): this {
    this.data = {};

    return this.save();
  }

  public refresh(): this {
    try {
      const contents = fs.readFileSync(ConfigWriter.filepath, 'utf8');
      const parsed = YAML.parse(contents);
      this.data = isEmpty(parsed) ? {} : parsed;
    } catch {
      this.data = {};
    }

    return this;
  }

  public refreshAndSave(): this {
    const d = cloneDeep(this.data);
    this.refresh();
    merge(this.data, d);

    return this.save();
  }

  public save(): this {
    if (isEmpty(this.data)) {
      try {
        fs.unlinkSync(ConfigWriter.filepath);
      } catch {
        //noop
      }
    } else {
      //tslint:disable-next-line:no-magic-numbers
      fs.writeFileSync(ConfigWriter.filepath, YAML.stringify(this.data, Number.MAX_VALUE, 2));
    }

    return this;
  }

  public set(key: string, value: any, scope: string = Conf.DEFAULT_SCOPE): this {
    set(this.data, [scope, key], value);

    return this;
  }

  public unset(key: string, scope: string = Conf.DEFAULT_SCOPE): this {
    unset(this.data, [scope, key]);
    if (isEmpty(this.data[scope])) {
      delete this.data[scope];
    }

    return this;
  }
}
