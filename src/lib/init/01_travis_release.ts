import * as fs from 'fs-extra';
import {forEach} from 'lodash';
import {EOL} from 'os';
import {addGhRepo, addGhUser} from '../../commons/identity';
import {addTravisRelease, TravisEndpoint} from '../../commons/travisRelease';
import {Chmod} from '../../const/Chmod';
import {InitConf} from '../../interfaces/InitConf';
import {Base64} from '../Base64';
import {Fixture} from '../Fixture';
import {Git} from '../Git';
import {Log} from '../Log';
import {PromptableConfig} from '../PromptableConfig';
import {BaseArgs, envVarExists, setEnvVar, setStdSettings} from '../sync-request/travis/travis';

export const enum TravisReleaseInitConf {
  PREP_FILE = '.alobuild-prep-release.sh'
}

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
      BUILD_GPG_KEY_ID: () => c.promptedGpgKeyId(),
      BUILD_GPG_KEY_PWD: () => c.promptedGpgKeyPwd(),
      BUILD_GPG_PRIV_KEY: () => Base64.encodeString(c.promptedGpgPrivkey()),
      BUILD_GPG_PUB_KEY: () => Base64.encodeString(c.promptedGpgPubkey()),
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

    if (!fs.existsSync(TravisReleaseInitConf.PREP_FILE)) {
      const fx = new Fixture('init');
      fx.copy(TravisReleaseInitConf.PREP_FILE, TravisReleaseInitConf.PREP_FILE, Chmod.C_755);
      Git.add(TravisReleaseInitConf.PREP_FILE);
    }

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
