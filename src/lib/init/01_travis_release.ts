import {forEach} from 'lodash';
import {EOL} from 'os';
import {addGhRepo, addGhUser} from '../../commons/identity';
import {addTravisRelease, TravisEndpoint} from '../../commons/travisRelease';
import {InitConf} from '../../interfaces/InitConf';
import {Log} from '../Log';
import {PromptableConfig} from '../PromptableConfig';
import {BaseArgs, envVarExists, setEnvVar, setStdSettings} from '../sync-request/travis/travis';

export const options = addTravisRelease();
addGhRepo(options);
addGhUser(options);

export function handle(c: PromptableConfig<InitConf>): void {
  if (c.get('skipTravisRelease')) {
    Log.info('Skipping Travis release');

    return;
  }

  Log.info('Setting up Travis release');

  try {
    const endpoint = c.get('travisEndpoint');
    const ort: BaseArgs = {
      owner: c.promptedGhUser(),
      pro: endpoint === TravisEndpoint.PRO,
      repo: c.promptedGhRepo(),
      token: endpoint === TravisEndpoint.PRO ? c.promptedTravisTokenPro() : c.promptedTravisTokenOrg()
    };

    setStdSettings(ort);
    const envVarsToSet: { [k: string]: () => string } = {
      GH_TOKEN: () => c.promptedReleaseGhToken(),
      GIT_COMMITTER_EMAIL: () => c.promptedGhEmail(),
      GIT_COMMITTER_NAME: () => c.promptedName(),
      GIT_EMAIL: () => c.promptedGhEmail(),
      GIT_USERNAME: () => c.promptedName(),
      NPM_TOKEN: () => c.promptedReleaseNpmToken()
    };
    forEach(envVarsToSet, (getVarFn, varName) => {
      if (!envVarExists(Object.assign({}, ort, {name: varName}))) {
        setEnvVar(Object.assign({}, ort, {
          name: varName,
          public: false,
          value: getVarFn()
        }));
      }
    });

    Log.success('Set up Travis release');
  } catch (e) {
    process.stderr.write(<string>(e.stack || e.message || e.toString()) + EOL + EOL);
    const msg = 'travis-ci environment setup failed with the error above. Do you want to still want to continue?';

    if (PromptableConfig.readline.keyInYNStrict(msg)) {
      Log.warn('Travis release failed; user chose to continue.');
    } else {
      Log.err('Travis release failed. Terminating setup.');
      process.exit(1);
    }
  }
}
