import * as fs from 'fs-extra';
import {Git} from '../Git';
import {Log} from '../Log';

export const options = {};

export function handle(): void {
  //tslint:disable:object-literal-sort-keys no-magic-numbers
  const tsc = {
    default: {
      compilerOptions: {
        module: 'commonjs',
        strictBindCallApply: true,
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
}
