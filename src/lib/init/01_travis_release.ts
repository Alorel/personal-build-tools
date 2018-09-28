import * as fs from 'fs-extra';
import {Base64} from 'js-base64';
import {forEach} from 'lodash';
import {addGhRepo, addGhUser} from '../../commons/identity';
import {addTravisRelease, TravisEndpoint} from '../../commons/travisRelease';
import {Chmod} from '../../const/Chmod';
import {InitConf} from '../../interfaces/InitConf';
import {Fixture} from '../Fixture';
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

  const endpoint = c.get('travisEndpoint');
  const ort: BaseArgs = {
    owner: c.promptedGhUser(),
    pro: endpoint === TravisEndpoint.PRO,
    repo: c.promptedGhRepo(),
    token: endpoint === TravisEndpoint.PRO ? c.promptedTravisTokenPro() : c.promptedTravisTokenOrg()
  };

  setStdSettings(ort);
  const envVarsToSet: { [k: string]: () => string } = {
    BUILD_GPG_KEY_ID: () => c.promptedGpgKeyId(),
    BUILD_GPG_KEY_PWD: () => c.promptedGpgKeyPwd(),
    BUILD_GPG_PRIV_KEY: () => Base64.encode(c.promptedGpgPrivkey()),
    BUILD_GPG_PUB_KEY: () => Base64.encode(c.promptedGpgPubkey()),
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

  const prepFile = '.alobuild-prep-release.sh';
  if (!fs.existsSync(prepFile)) {
    const fx = new Fixture('init');
    fx.copy(prepFile, prepFile, Chmod.C_755);
  }

  Log.success('Set up Travis release');
}
