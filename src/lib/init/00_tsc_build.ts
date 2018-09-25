import * as fs from 'fs-extra';
import {addUmd} from '../../commons/buildType';
import {InitConf} from '../../interfaces/InitConf';
import {Git} from '../Git';
import {Log} from '../Log';
import {PromptableConfig} from '../PromptableConfig';

export const options = addUmd();

export function handle(c: PromptableConfig<InitConf>): void {
  //tslint:disable:object-literal-sort-keys no-magic-numbers
  const tsc = {
    default: {
      compilerOptions: {
        module: 'commonjs',
        target: 'es5',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        newLine: 'lf',
        noFallthroughCasesInSwitch: true,
        suppressImplicitAnyIndexErrors: true,
        importHelpers: true,
        allowUnreachableCode: false,
        allowUnusedLabels: false,
        strict: true,
        stripInternal: true,
        declaration: false,
        noImplicitAny: true,
        strictNullChecks: true,
        strictPropertyInitialization: false,
        removeComments: false,
        moduleResolution: 'node',
        sourceMap: true,
        outDir: 'dist'
      },
      include: [
        'src'
      ],
      exclude: [
        'node_modules'
      ]
    },
    test: {
      extends: './tsconfig.json',
      compilerOptions: {
        target: 'es6'
      },
      include: [
        'src',
        'test'
      ]
    },
    umd: {
      extends: './tsconfig.json',
      compilerOptions: {
        module: 'es2015',
        target: 'es5',
        sourceMap: false
      }
    }
  };

  //tslint:enable:object-literal-sort-keys

  function write(file: string, key: keyof typeof tsc): void {
    if (!fs.pathExistsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(tsc[key], null, 2) + '\n');
      Git.add(file);
      Log.success(`Wrote ${file}`);
    } else {
      Log.info(`Skipped ${file}`);
    }
  }

  write('tsconfig.json', 'default');
  write('tsconfig.test.json', 'test');

  if (c.get('umd')) {
    write('tsconfig.umd.json', 'umd');
  }
}
