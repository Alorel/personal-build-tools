import {isEmpty} from 'lodash';
import {Options} from 'yargs';
import {addGhRepo, addGhToken, addGhUser} from '../../commons/identity';
import {InitConf} from '../../interfaces/InitConf';
import {Obj} from '../../interfaces/OptionsObject';
import {Git} from '../Git';
import {ObjectWriter, ObjectWriterFormat} from '../ObjectWriter';
import {PromptableConfig} from '../PromptableConfig';

export const options: Obj<Options> = {
  'project-desc': {
    describe: 'Project description',
    type: 'string'
  },
  'project-keywords': {
    describe: 'Project keywords',
    type: 'array'
  },
  'project-name': {
    describe: 'Name of the project',
    type: 'string'
  }
};

addGhUser(options);
addGhRepo(options);
addGhToken(options);

export function handle(c: PromptableConfig<InitConf>): void {
  const w = new ObjectWriter('package.json', ObjectWriterFormat.JSON);

  if (!w.has('name')) {
    w.set('name', c.promptedProjectName());
  }

  w.set('version', '0.0.1', false);

  if (!w.has('description')) {
    w.set('description', c.promptedProjectDescription());
  }

  w.set('main', 'index.js', false);
  w.set('types', 'index.d.ts', false);
  w.set('typings', 'index.d.ts', false);
  w.set('scripts.pretest', 'rimraf coverage', false);
  w.set('scripts.test', 'nyc mocha --opts ./mocha.opts', false);
  w.set('scripts.tslint', 'alo tslint -p tsconfig.test.json', false);
  w.set(['scripts', 'tslint:fix'], 'npm run tslint -- --fix', false);
  w.set('scripts.prebuild', 'rimraf dist', false);

  if (isEmpty(w.get('keywords'))) {
    w.set('keywords', c.promptedProjectKeywords());
  }

  if (Git.originUrl) {
    w.set('repository', Git.originUrl, false);
  }

  w.save();

  Git.add('package.json');
}
