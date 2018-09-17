import {Options} from 'yargs';
import {addGhUser} from '../../commons/identity';
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
  'project-name': {
    describe: 'Name of the project',
    type: 'string'
  }
};

addGhUser(options);

export function handle(c: PromptableConfig<InitConf>): void {
  const w = new ObjectWriter('package.json', ObjectWriterFormat.JSON);

  if (!w.has('name')) {
    w.set('name', c.promptedProjectName());
  }
  w.set('version', '0.0.1', false);

  if (Git.originUrl) {
    w.set('repository', Git.originUrl);
  }

  Git.add('package.json');
}
