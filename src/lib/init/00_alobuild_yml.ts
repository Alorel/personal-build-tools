import * as fs from 'fs-extra';
import {Fixture} from '../Fixture';
import {Git} from '../Git';
import {Log} from '../Log';

const enum Conf {
  FILE = '.alobuild.yml'
}

export function handle() {
  if (fs.pathExistsSync('.alobuild.yml')) {
    Log.info('Skipping .alobuild.yml');
  } else {
    new Fixture('init').copy(Conf.FILE, Conf.FILE);
    Git.add(Conf.FILE);
    Log.success('Generated .alobuild.yml');
  }
}
