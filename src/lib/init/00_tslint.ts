import * as fs from 'fs-extra';
import {Git} from '../Git';
import {Log} from '../Log';

const enum Paths {
  TSLINT = 'tslint.json'
}

export function handle(): void {
  if (!fs.pathExistsSync(Paths.TSLINT)) {
    const contents = {
      extends: './node_modules/@alorel-personal/tslint-rules/tslint.json'
    };

    //tslint:disable-next-line:no-magic-numbers
    fs.writeFileSync(Paths.TSLINT, JSON.stringify(contents, null, 2) + '\n');
    Git.add(Paths.TSLINT);
    Log.success('Wrote tslint.json');
  } else {
    Log.info('Skipped tslint.json');
  }
}
