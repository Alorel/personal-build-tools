import * as fs from 'fs';
import {Fixture} from '../Fixture';
import {Git} from '../Git';
import {Log} from '../Log';

const enum Conf {
  FILE = '.releaserc.yml'
}

export function handle(): void {
  const hasReleaseRc: boolean = (() => {
    const rds = fs.readdirSync(process.cwd(), 'utf8');

    for (const f of rds) {
      if (f.startsWith('.releaserc')) {
        return true;
      }
    }

    return false;
  })();

  if (hasReleaseRc) {
    Log.info('Skipping .releaserc');

    return;
  }

  new Fixture('init').copy(Conf.FILE, Conf.FILE);
  Git.add(Conf.FILE);

  Log.success('Generated .releaserc');
}
