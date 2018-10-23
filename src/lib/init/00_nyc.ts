import * as fs from 'fs-extra';
import {Git} from '../Git';
import {Log} from '../Log';

export function handle() {
  if (!fs.pathExistsSync('.nycrc')) {
    fs.writeFileSync(
      '.nycrc',
      JSON.stringify(
        {
          //tslint:disable:object-literal-sort-keys
          reporter: [
            'text',
            'text-summary',
            'html',
            'lcov'
          ],
          extension: [
            '.ts'
          ],
          require: [
            'ts-node/register'
          ],
          exclude: [
            '**/test/**/*',
            '**/webpack.config.js',
            '**/rollup.config.js'
          ],
          sourceMap: true,
          instrument: true
        },
        //tslint:enable:object-literal-sort-keys
        null,
        2 //tslint:disable-line:no-magic-numbers
      ) + '\n'
    );
    Git.add('.nycrc');
    Log.success('Generated .nycrc');
  } else {
    Log.info('Skipping .nycrc');
  }
}
