import * as fs from 'fs-extra';
import * as JSON5 from 'json5';
import {addUmd} from '../../commons/buildType';
import {InitConf} from '../../interfaces/InitConf';
import {Log} from '../Log';
import {PromptableConfig} from '../PromptableConfig';

export const options = addUmd();

export function handle(c: PromptableConfig<InitConf>): void {
  let umd: string;
  if (!(umd = c.get('umd')) || fs.pathExistsSync('webpack.config.js')) {
    Log.info('Skipping webpack.config.js');

    return;
  }

  function contents(): string {
    return `const {join} = require('path');
const merge = require('lodash/merge');
const cloneDeep = require('lodash/cloneDeep');

const base = {
  target: 'web',
  entry: join(__dirname, 'src', 'index.ts'),
  devtool: 'none',
  output: {
    path: join(__dirname, 'dist', 'umd'),
    libraryTarget: 'umd',
    library: ${JSON5.stringify(umd)}
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: join(__dirname, 'tsconfig.umd.json')
          }
        }]
      }
    ]
  }
};

module.exports = [
  merge(cloneDeep(base), {mode: 'development', output: {filename: 'bundle.js'}}),
  merge(cloneDeep(base), {mode: 'production', output: {filename: 'bundle.min.js'}})
];
`;
  }

  fs.writeFileSync('webpack.config.js', contents());
  Log.success('Wrote webpack.config.js');
}
