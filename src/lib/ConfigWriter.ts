import * as fs from 'fs';
import {cloneDeep, get, isEmpty, merge, set, unset} from 'lodash';
import {homedir} from 'os';
import {join} from 'path';
import * as YAML from 'yamljs';
import {defaultCfgName} from '../const/defaultCfgName';

const enum Conf {
  DEFAULT_SCOPE = 'global'
}

export interface Data {
  global?: { [k: string]: any };

  [k: string]: any;
}

const _data: unique symbol = Symbol('data');

export class ConfigWriter {

  public static readonly filepath: string = join(homedir(), defaultCfgName);

  private [_data]: Data;

  public constructor(private readonly file: string = ConfigWriter.filepath) {
    this.refresh();
  }

  public get data(): Data {
    return this[_data];
  }

  /** This will automatically save */
  public clear(): this {
    this[_data] = {};

    return this.save();
  }

  public get<T = any>(key: string, scope: string = Conf.DEFAULT_SCOPE): T | null {
    return get(this[_data], [scope, key], null);
  }

  public refresh(): this {
    try {
      const contents = fs.readFileSync(this.file, 'utf8');
      const parsed = YAML.parse(contents);
      this[_data] = isEmpty(parsed) ? {} : parsed;
    } catch {
      this[_data] = {};
    }

    return this;
  }

  public refreshAndSave(): this {
    const d = cloneDeep(this[_data]);
    this.refresh();
    merge(this[_data], d);

    return this.save();
  }

  public save(): this {
    if (isEmpty(this[_data])) {
      try {
        fs.unlinkSync(this.file);
      } catch {
        //noop
      }
    } else {
      //tslint:disable-next-line:no-magic-numbers
      fs.writeFileSync(this.file, YAML.stringify(this[_data], Number.MAX_VALUE, 2));
    }

    return this;
  }

  public set<T = any>(key: string, value: T, scope: string = Conf.DEFAULT_SCOPE): this {
    set(this[_data], [scope, key], value);

    return this;
  }

  public unset(key: string, scope: string = Conf.DEFAULT_SCOPE): this {
    unset(this[_data], [scope, key]);
    if (isEmpty(this[_data][scope])) {
      delete this[_data][scope];
    }

    return this;
  }
}
