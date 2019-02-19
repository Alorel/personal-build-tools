import {SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import * as fs from 'fs';
import {castArray, cloneDeep, has, merge, noop, omit, padStart, set, uniq} from 'lodash';
import * as moment from 'moment';
import {EOL} from 'os';
import {basename, extname, join} from 'path';
import {sync as rimraf} from 'rimraf';
import {RollupOptions} from 'rollup';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {CommandModule} from 'yargs';
import {ext} from '../const/ext';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {execLocal} from '../fns/execLocal';
import {getBin} from '../fns/getBin';
import {mkTsconfig} from '../fns/mkTsconfig';
import {readJson} from '../fns/readJson';
import {unlinkSafe} from '../fns/unlinkSafe';
import {xSpawnSync} from '../fns/xSpawn';
import {allBuildTargets, BuildTarget, isBuildTarget} from '../interfaces/BuildTarget';
import {Obj} from '../interfaces/OptionsObject';
import {CLISerialiser} from '../lib/cli-serialiser';
import {Log} from '../lib/Log';
import {tmp} from '../lib/tmp';

const enum Conf {
  TSCONFIG_PREFIX = '.alobuild-tsconfig-',
  INDENT = 2,
  PAD = 2,
  PAD_MS = 3,
  PAD_CHAR = '0',
  PKG_JSON_PATH = './package.json'
}

const enum Txt {
  SKIP_UMD = 'Skipping UMD',
  SKIP_FESM5 = 'Skipping FESM5',
  SKIP_FESM2015 = 'Skipping FESM2015'
}

interface BuildConf {
  entry: string;

  externals: string[];

  ignoreUmdExternals: string[];

  lb: boolean;

  out: string;

  rollup: string;

  targets: BuildTarget[];

  tsconfig: Obj<any>;

  umdName: string;
}

const command = cmdName(__filename);

const defaultUmdName: string = (() => {
  try {
    return (<any>readJson(Conf.PKG_JSON_PATH)).name;
  } catch {
    return <any>undefined;
  }
})();
const tscBin = getBin('typescript', 'tsc');
const rollupCmdFile = require.resolve(`../lib/build/cmd.${ext}`);

const cmd: CommandModule<BuildConf, BuildConf> = {
  builder(argv): any {
    return addConfig(argv, command)
      .option('entry', {
        alias: 'e',
        default: 'src/index.ts',
        describe: 'Entry file',
        type: 'string'
      })
      .option('externals', {
        alias: 'x',
        coerce: castArray,
        default: [],
        describe: 'External dependencies',
        type: 'array'
      })
      .option('ignore-umd-externals', {
        alias: 'iux',
        coerce(v: string[]): string[] {
          let out = ['tslib'];

          if (v && v.length) {
            out.push(...v);

            out = uniq(out);
          }

          return out;
        },
        default: ['tslib'],
        describe: 'Override the externals option and always bundle the following packages in UMD',
        type: 'array'
      })
      .option('license-banner', {
        alias: 'lb',
        default: false,
        describe: 'Include the license as a banner in FESM & UMD bundles',
        type: 'boolean'
      })
      .option('out', {
        alias: 'o',
        default: 'dist',
        describe: 'Output directory',
        type: 'string'
      })
      .option('rollup', {
        alias: 'r',
        default: 'rollup.config.js',
        describe: 'Path ro rollup config file',
        type: 'string'
      })
      .option('targets', {
        alias: 't',
        choices: allBuildTargets,
        coerce: castArray,
        default: allBuildTargets,
        describe: 'Build targets',
        type: 'array'
      })
      .option('umd-name', {
        alias: 'u',
        default: defaultUmdName,
        describe: 'UMD global variable name',
        type: 'string'
      })
      .option('tsconfig', {
        alias: 'ts',
        coerce(path: string): any {
          let out: any = {};
          let last: any;

          do {
            last = readJson(path);
            if (!last) {
              throw new Error(`Path not found: ${path}`);
            }
            out = omit(merge(cloneDeep(last), out), ['extends']);
            if (last.extends) {
              path = last.extends;
            }
          } while (last && last.extends);

          return out;
        },
        describe: 'Path to tsconfig file to inherit from',
        type: 'string'
      });
  },
  command,
  describe: 'Build the project',
  handler(c) {
    const start = Date.now();
    validate(c);
    Log.info(`Clearing ${c.out}`);
    rimraf(c.out);
    Log.success(`${c.out} cleared.`);
    const tmpTsconfigs: string[] = [];
    try {
      buildCJsOrDeclaration(c, tmpTsconfigs);
      buildESM(c, tmpTsconfigs);
      buildRollup(c);
      Log.info('Writing package.json');
      new PackageJsonBuilder(c).write();
      Log.success('Wrote package.json');
      Log.success(`Build finished in ${getDuration(start)}`);
    } catch (e) {
      Log.err(`Build errored in ${getDuration(start)}`);

      throw e;
    } finally {
      tmpTsconfigs.forEach(unlinkSafe);
    }
  }
};

function validate(c: BuildConf): void {
  if (c.targets.includes(BuildTarget.UMD) && !c.umdName) {
    throw new Error('umd-name is required when one of the targets is UMD');
  }
  if (!c.targets.length) {
    throw new Error('No targets specified');
  }
  for (const t of c.targets) {
    if (!isBuildTarget(t)) {
      throw new Error(`Unknown build target: ${JSON.stringify(t)}`);
    }
  }
}

function buildRollup(c: BuildConf): void {
  const incUMD = c.targets.includes(BuildTarget.UMD);
  const incFESM5 = c.targets.includes(BuildTarget.FESM5);
  const incFESM2015 = c.targets.includes(BuildTarget.FESM2015);
  const banner: string | null = (() => {
    if (c.lb) {
      let e: Error = <any>null;
      for (const p of ['LICENSE', 'LICENSE.txt']) {
        try {
          const contents = fs.readFileSync(p, 'utf8');

          return [
            '/*!',
            contents,
            '*/',
            '',
            ''
          ].join(EOL);
        } catch (err) {
          e = err;
        }
      }
      if (e) {
        Log.warn(`Unable to set license banner: ${e.stack || e.toString() || e.message}`);
      }
    }

    return null;
  })();

  if (!incUMD && !incFESM5 && !incFESM2015) {
    Log.info(Txt.SKIP_UMD);
    Log.info(Txt.SKIP_FESM5);
    Log.info(Txt.SKIP_FESM2015);

    return;
  }

  const stdConf = merge({output: {sourcemap: true}}, loadRollupConfig(c));
  stdConf.input = c.entry;
  stdConf.plugins = [];
  if (c.externals && c.externals.length) {
    if (Array.isArray(stdConf.external)) {
      stdConf.external.unshift(...c.externals);
      stdConf.external = uniq(c.externals);
    } else {
      stdConf.external = c.externals;
    }
  }
  if (banner && !has(stdConf, 'output.banner')) {
    set(stdConf, 'output.banner', banner);
  }

  set(stdConf, 'output.name', c.umdName);
  set(stdConf, 'output.amd.id', (<any>readJson(Conf.PKG_JSON_PATH)).name);

  const execOpts: SpawnSyncOptions = {
    cwd: process.cwd(),
    stdio: 'inherit'
  };

  const stdArgs: string[] = [
    '--opts',
    CLISerialiser.serialise(stdConf),
    '--tsconfig',
    CLISerialiser.serialise(c.tsconfig),
    '--ignored-externals',
    CLISerialiser.serialise(c.ignoreUmdExternals),
    '--dist',
    c.out
  ];

  if (incFESM2015) {
    throwIfErrored(execLocal(
      rollupCmdFile,
      stdArgs.concat('--formats', BuildTarget.FESM2015),
      execOpts
    ));
  } else {
    Log.info(Txt.SKIP_FESM2015);
  }
  if (incFESM5 || incUMD) {
    const formats: any[] = [];

    if (incFESM5) {
      formats.push(BuildTarget.FESM5);
    } else {
      Log.info(Txt.SKIP_FESM5);
    }

    if (incUMD) {
      formats.push(BuildTarget.UMD);
    } else {
      Log.info(Txt.SKIP_UMD);
    }

    throwIfErrored(execLocal(
      rollupCmdFile,
      stdArgs.concat('--formats', ...formats),
      execOpts
    ));
  } else {
    Log.info(Txt.SKIP_FESM5);
    Log.info(Txt.SKIP_UMD);
  }
}

class PackageJsonBuilder {
  private readonly pkgJson: Obj<any>;

  public constructor(private readonly cfg: BuildConf) {
    this.pkgJson = readJson(Conf.PKG_JSON_PATH) || {};
  }

  @LazyGetter()
  private get _base(): string {
    const ext$ = extname(this.cfg.entry);

    return basename(this.cfg.entry, ext$);
  }

  @LazyGetter()
  private get _baseJS(): string {
    return this._base + '.js';
  }

  @LazyGetter()
  private get browser(): string | null {
    if (this.cfg.targets.includes(BuildTarget.UMD)) {
      return '_bundle/umd.js';
    }

    return null;
  }

  @LazyGetter()
  //@ts-ignore
  private get esm2015(): string | null {
    if (this.cfg.targets.includes(BuildTarget.ESM2015)) {
      return `_bundle/esm2015/${this._baseJS}`;
    }

    return this.fesm5;
  }

  @LazyGetter()
  //@ts-ignore
  private get esm5(): string | null {
    if (this.cfg.targets.includes(BuildTarget.ESM5)) {
      return `_bundle/esm5/${this._baseJS}`;
    }

    return this.fesm5;
  }

  @LazyGetter()
  //@ts-ignore
  private get fesm2015(): string | null {
    if (this.cfg.targets.includes(BuildTarget.FESM2015)) {
      return '_bundle/fesm2015.js';
    }

    return null;
  }

  @LazyGetter()
  //@ts-ignore
  private get fesm5(): string | null {
    if (this.cfg.targets.includes(BuildTarget.FESM5)) {
      return '_bundle/fesm5.js';
    }

    return null;
  }

  @LazyGetter()
  //@ts-ignore
  private get jsdelivr(): string | null {
    if (this.browser) {
      return `_bundle/umd.min.js`;
    }

    return null;
  }

  @LazyGetter()
  //@ts-ignore
  private get main(): string | null {
    if (this.cfg.targets.includes(BuildTarget.CJS)) {
      return this._baseJS;
    } else if (this.browser) {
      return this.browser;
    } else {
      throw new Error('Unable to resolve main file');
    }
  }

  @LazyGetter()
  //@ts-ignore
  private get module(): string | null {
    return this.fesm5 || this.esm5;
  }

  @LazyGetter()
  //@ts-ignore
  private get types(): string | null {
    if (this.cfg.targets.includes(BuildTarget.DECLARATION)) {
      return `${this._base}.d.ts`;
    }

    return null;
  }

  public write(): void {
    for (const p of ['main', 'browser', 'jsdelivr', 'fesm5', 'esm5', 'fesm2015', 'esm2015', 'types', 'module']) {
      if (this[p]) {
        this.pkgJson[p] = this[p];
      } else {
        delete this.pkgJson[p];
      }
    }
    if (this.types) {
      this.pkgJson.typings = this.types;
    } else {
      delete this.pkgJson.typings;
    }

    fs.writeFileSync(Conf.PKG_JSON_PATH, JSON.stringify(this.pkgJson, null, Conf.INDENT));
    this.write = noop;
  }
}

function loadRollupConfig(c: BuildConf): RollupOptions {
  try {
    if (c.rollup) {
      const fullPath = join(process.cwd(), c.rollup);
      const contents = fs.readFileSync(fullPath, 'utf8');
      const reg = /export\s+default/g;
      if (reg.test(contents)) {
        try {
          const newContents = contents.replace(reg, 'module.exports = ');
          fs.writeFileSync(fullPath, newContents);

          return cloneDeep(require(fullPath));
        } finally {
          fs.writeFileSync(fullPath, contents);
        }
      } else {
        return cloneDeep(require(fullPath));
      }
    }
  } catch {
    //noop
  }

  return <any>{};
}

function buildESM(c: BuildConf, tmpTsConfigs: string[]): void {
  if (c.targets.includes(BuildTarget.ESM5)) {
    Log.info('Building ESM5');
    spawnTsc(makeTmpTsconfig(c, tmpTsConfigs, {
      compilerOptions: {
        declaration: false,
        module: 'es2015',
        outDir: join(c.out, '_bundle', 'esm5'),
        target: 'es5'
      }
    }));
    Log.success('Built ESM5');
  } else {
    Log.info('Skipping ESM5');
  }

  if (c.targets.includes(BuildTarget.ESM2015)) {
    Log.info('Building ESM2015');
    spawnTsc(makeTmpTsconfig(c, tmpTsConfigs, {
      compilerOptions: {
        declaration: false,
        module: 'es2015',
        outDir: join(c.out, '_bundle', 'esm2015'),
        target: 'esnext'
      }
    }));
    Log.success('Built ESM2015');
  } else {
    Log.info('Skipping ESM2015');
  }
}

function buildCJsOrDeclaration(c: BuildConf, tmpTsconfigs: string[]): void {
  const needsDeclaration = c.targets.includes(BuildTarget.DECLARATION);

  if (c.targets.includes(BuildTarget.CJS)) {
    if (!needsDeclaration) {
      Log.info('Skipping declaration');
    }
    const building = needsDeclaration ? 'CommonJS + declaration' : 'CommonJS';
    Log.info(`Building ${building}`);

    spawnTsc(makeTmpTsconfig(c, tmpTsconfigs, {
      compilerOptions: {
        declaration: needsDeclaration,
        module: 'commonjs',
        outDir: c.out
      }
    }));

    Log.success(`Built ${building}`);
  } else if (needsDeclaration) {
    Log.info('Skipping commonjs');
    Log.info('Building declaration');

    spawnTsc(makeTmpTsconfig(c, tmpTsconfigs, {
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        module: 'commonjs',
        outDir: c.out,
        sourceMap: false
      }
    }));

    Log.success('Built declaration');
  } else {
    Log.info('Skipping commonjs');
    Log.info('Skipping declaration');
  }
}

function makeTmpTsconfig(c: BuildConf, cleanupArray: string[], overrides?: any): string {
  const path = tmp.fileSync({
    dir: process.cwd(),
    postfix: '.json',
    prefix: <string>Conf.TSCONFIG_PREFIX
  }).name;
  const tsconfig = mkTsconfig(merge(cloneDeep(c.tsconfig), overrides || {}));
  delete tsconfig.compilerOptions.outFile;
  fs.writeFileSync(path, JSON.stringify(tsconfig, null, <number>Conf.INDENT));
  cleanupArray.push(path);

  return path;
}

function spawnTsc(tsconfigPath: string): void {
  const proc = xSpawnSync(process.execPath, [tscBin, '-p', tsconfigPath], {stdio: 'inherit'});
  throwIfErrored(proc);
}

function throwIfErrored(res: SpawnSyncReturns<any>): void {
  if (res.status !== 0) {
    throw new Error(`Process exited with code ${res.status}`);
  }
}

function getDuration(startPoint: number): string {
  const d = moment.duration(Date.now() - startPoint);

  return [
    d.hours().toString(),
    padStart(d.minutes().toString(), Conf.PAD, Conf.PAD_CHAR),
    padStart(d.seconds().toString(), Conf.PAD, Conf.PAD_CHAR)
  ].join(':') + `.${padStart(d.milliseconds().toString(), Conf.PAD_MS, Conf.PAD_CHAR)}`;
}

// Cleanup on startup
fs.readdirSync(process.cwd(), 'utf8')
  .filter(p => p.startsWith(Conf.TSCONFIG_PREFIX) && p.endsWith('.json'))
  .forEach(unlinkSafe);

//tslint:disable:max-file-line-count

export = cmd;
