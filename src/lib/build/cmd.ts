import * as fs from 'fs';
import {cloneDeep, merge, pull} from 'lodash';
import {EOL} from 'os';
import {join} from 'path';
import {rollup} from 'rollup';
import * as rollupTsPlugin$ from 'rollup-plugin-typescript2';
import {minify as uglify} from 'uglify-es';
import * as yargs from 'yargs';
import {mkTsconfig} from '../../fns/mkTsconfig';
import {BuildTarget} from '../../interfaces/BuildTarget';
import {CLISerialiser} from '../cli-serialiser';
import {Log} from '../Log';
import {tmp} from '../tmp';

type Opts = yargs.Arguments & {
  dist: string;
  formats: BuildTarget[];
  ignoredExternals: string[];
  opts: any;
  tsconfig: any;
};

function coerce(v: any): any {
  return CLISerialiser.unserialise(v);
}

const argv: Opts = <any>yargs
  .option('opts', {
    coerce,
    demandOption: true,
    type: 'string'
  })
  .option('dist', {
    demandOption: true,
    type: 'string'
  })
  .option('ignored-externals', {
    coerce,
    demandOption: true,
    type: 'string'
  })
  .option('tsconfig', {
    coerce,
    demandOption: true,
    type: 'string'
  })
  .option('formats', {
    demandOption: true,
    type: 'array'
  })
  .argv;

delete argv.opts.output.format;
delete argv.opts.output.dir;
delete argv.opts.output.file;

const rollupTsPlugin: any = rollupTsPlugin$;
const incUmd = argv.formats.includes(BuildTarget.UMD);
const inc5 = argv.formats.includes(BuildTarget.FESM5);

function mkRollupTsConfig(overrides?: any): any {
  return {
    cacheRoot: tmp.dirSync({unsafeCleanup: true}).name,
    tsconfigOverride: merge(
      cloneDeep(argv.tsconfig),
      mkTsconfig(overrides),
      {
        compilerOptions: {
          module: 'es2015'
        }
      }
    )
  };
}

const bundleDir = join(process.cwd(), argv.dist, '_bundle');

(async () => {
  if (incUmd || inc5) {
    const baseOpts: any = cloneDeep(argv.opts);
    baseOpts.plugins.push(rollupTsPlugin(mkRollupTsConfig({
      compilerOptions: {
        target: 'es5'
      }
    })));
    if (incUmd) {
      const opts = cloneDeep(baseOpts);
      //tslint:disable-next-line:no-var-requires
      const nodeResolve: any = require('rollup-plugin-node-resolve');
      baseOpts.plugins.push(nodeResolve());

      const unminifiedFile = join(bundleDir, 'umd.js');
      if (Array.isArray(opts.external) && opts.external.includes('tslib')) {
        Log.info(`Removing ${argv.ignoredExternals.join(', ')} from UMD bundle's externals`);
        pull(opts.external, ...argv.ignoredExternals);
      }

      Log.info('Compiling UMD');
      const rolled = await rollup(opts);

      Log.info('Writing UMD');
      await rolled.write(merge(cloneDeep(opts.output), {
        file: unminifiedFile,
        format: 'umd'
      }));

      Log.info('Minifying UMD');
      const uglified = uglify(fs.readFileSync(unminifiedFile, 'utf8'));

      if (uglified.error) {
        throw uglified.error;
      } else {
        let output = uglified.code;
        if (opts.output.banner) {
          output = <string>opts.output.banner + output;
        }
        fs.writeFileSync(join(bundleDir, 'umd.min.js'), output);
      }

      Log.success('Finished UMD');
    }
    if (inc5) {
      Log.info('Compiling FESM5');
      const rolled = await rollup(baseOpts);

      Log.info('Writing FESM5');
      await rolled.write(merge(cloneDeep(baseOpts.output), {
        file: join(bundleDir, 'fesm5.js'),
        format: 'esm'
      }));

      Log.success('Finished FESM5');
    }
  } else if (argv.formats.includes(BuildTarget.FESM2015)) {
    Log.info('Compiling FESM2015');

    const opts = cloneDeep(argv.opts);
    opts.plugins.push(rollupTsPlugin(mkRollupTsConfig({
      compilerOptions: {
        target: 'esnext'
      }
    })));
    const rolled = await rollup(opts);

    Log.info('Writing FESM2015');
    await rolled.write(merge(cloneDeep(opts.output), {
      file: join(bundleDir, 'fesm2015.js'),
      format: 'esm'
    }));

    Log.success('Finished FESM2015');
  }
})().catch((e: Error) => {
  process.stderr.write((e.stack || e.toString() || e.message) + EOL, () => {
    process.exit(1);
  });
});
