/* istanbul ignore file */
import * as fs from 'fs-extra';
import {dirname, join} from 'path';
import 'reflect-metadata';
import {Argv, CommandModule, Options} from 'yargs';
import {xSpawnSync} from '../fns/xSpawn';

const spec: { readonly bin: string; readonly formattersDir: string } = {
  get bin(): string {
    const jsonPath = require.resolve('tslint/package.json');
    const rootDir = dirname(jsonPath);
    const contents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const value = join(rootDir, contents.bin.tslint);
    Object.defineProperty(spec, 'bin', {value});

    return value;
  },
  get formattersDir(): string {
    const root = dirname(require.resolve('custom-tslint-formatters/package.json'));
    const value = join(root, 'formatters');
    Object.defineProperty(spec, 'bin', {value});

    return value;
  }
};

const availableOpts: { [k: string]: Options } = {};

function setType(conf: Options, type: Options['type']): Options {
  return Object.assign({}, {type}, conf);
}

function Option(conf: Options & { overrideName?: string }): PropertyDecorator {
  return (target: any, name: PropertyKey): void => {
    if (conf.overrideName) {
      name = conf.overrideName;
      conf = Object.assign({}, conf);
      delete conf.overrideName;
    }
    switch (Reflect.getMetadata('design:type', target, <string>name)) {
      case Array:
        conf = setType(conf, 'array');
        break;
      case Boolean:
        conf = setType(conf, 'boolean');
        break;
      case Number:
        conf = setType(conf, 'number');
        break;
      case String:
        conf = setType(conf, 'string');
    }
    availableOpts[<string>name] = conf;
  };
}

class Conf {
  @Option({
    alias: 'c',
    describe: 'TSLint configuration file'
  })
  public config: string;

  @Option({
    alias: 'e',
    describe: 'Exclude globs from path expansion',
    type: 'array'
  })
  public exclude: string[];

  @Option({
    alias: 'x',
    describe: 'Fixes linting errors for select rules (this may overwrite linted files)'
  })
  public fix: boolean;

  @Option({describe: 'Return status code 0 even if there are lint errors'})
  public force: boolean;

  @Option({
    alias: 'i',
    describe: 'Generate a tslint.json config file in the current working directory'
  })
  public init: boolean;

  @Option({
    alias: 'o',
    describe: 'Output file'
  })
  public out: string;

  @Option({describe: 'Whether or not outputted file paths are absolute'})
  public outputAbsolutePaths: boolean;

  @Option({
    alias: 'p',
    describe: 'tsconfig.json file'
  })
  public project: string;

  @Option({
    alias: 'r',
    describe: 'Rules directory',
    overrideName: 'rules-dir'
  })
  public rulesDir: string;

  @Option({describe: 'Test that tslint produces the correct output for the specified directory'})
  public test: boolean;

  @Option({
    alias: 'tv',
    describe: 'Output tslint version',
    overrideName: 'tslint-version'
  })
  public tslintVersion: boolean;
}

const cmd: CommandModule<{}, Conf> = {
  builder(argv: Argv): any {
    return argv.options(availableOpts);
  },
  command: 'tslint',
  describe: 'tslint files with a pretty formatter',
  handler(c: Conf) {
    const args: string[] = [
      spec.bin,
      '-s',
      spec.formattersDir,
      '-t',
      'grouped'
    ];
    for (const optname of Object.keys(availableOpts)) {
      if (!(optname in c)) {
        continue;
      }
      if (optname === 'tslint-version') {
        args.push('--version');
      } else {
        args.push(`--${optname}`);
        if (Array.isArray(c[optname])) {
          args.push(...c[optname]);
        } else if (typeof c[optname] !== 'boolean') {
          args.push(c[optname]);
        }
      }
    }

    const result = xSpawnSync(process.execPath, args, {stdio: 'inherit'});

    if (result.status) {
      process.exit(result.status);
    }
  }
};

export = cmd;
