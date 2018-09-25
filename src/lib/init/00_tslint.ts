import * as fs from 'fs-extra';
import {Git} from '../Git';
import {Log} from '../Log';

export function handle(): void {
  if (!fs.pathExistsSync('tslint.json')) {
    const contents = {
      extends: './node_modules/@alorel-personal/tslint-rules/tslint.json'
    };

    //tslint:disable-next-line:no-magic-numbers
    fs.writeFileSync('tslint.json', JSON.stringify(contents, null, 2) + '\n');
    Git.add('tslint.json');
    Log.success('Wrote tslint.json');
  } else {
    Log.info('Skipped tslint.json');
  }
}
