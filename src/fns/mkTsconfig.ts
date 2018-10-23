import {merge} from 'lodash';
import {Obj} from '../interfaces/OptionsObject';

//tslint:disable:object-literal-sort-keys

export function mkTsconfig(override?: Obj<any>): Obj<any> {
  return merge(
    {
      compilerOptions: {
        module: 'commonjs',
        target: 'ESNext',
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
        noEmitOnError: true,
        strictNullChecks: true,
        strictPropertyInitialization: false,
        removeComments: false,
        moduleResolution: 'node',
        sourceMap: true,
        outDir: 'dist',
        lib: [
          'es5',
          'es2015',
          'es2016',
          'es2017',
          'esnext',
          'dom'
        ]
      },
      include: [
        'src'
      ],
      exclude: [
        'node_modules'
      ]
    }
    ,
    override || {}
  );
}
