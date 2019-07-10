import {values} from 'lodash';
import {Options} from 'yargs';
import {Obj} from '../interfaces/OptionsObject';

export enum TravisEndpoint {
  ORG = 'org',
  PRO = 'pro'
}

export interface HasTravisRelease {
  ghEmail: string;

  releaseGhToken: string;

  releaseNpmToken: string;

  skipTravisRelease: boolean;

  travisEndpoint: TravisEndpoint;

  travisTokenOrg: string;

  travisTokenPro: string;
}

export function addTravisRelease(opts: Obj<Options> = {}): Obj<Options> {
  const assigned: Obj<Options> = {
    'gh-email': {
      describe: 'Your GitHub email',
      type: 'string'
    },
    'release-gh-token': {
      describe: 'GitHub token for making releases. This should differ from the gh-token parameter and be local to '
        + 'this repo.',
      type: 'string'
    },
    'release-npm-token': {
      describe: 'NPM token for making releases. This should be unique to this repo.',
      type: 'string'
    },
    'skip-travis-release': {
      default: false,
      describe: 'Skip setting up a Travis release',
      type: 'boolean'
    },
    'travis-endpoint': {
      choices: values(TravisEndpoint),
      default: TravisEndpoint.PRO,
      describe: 'Travis endpoint to use',
      type: 'string'
    },
    'travis-token-org': {
      describe: `Travis token if using the ${TravisEndpoint.ORG} endpoint`,
      type: 'string'
    },
    'travis-token-pro': {
      describe: `Travis token if using the ${TravisEndpoint.PRO} endpoint`,
      type: 'string'
    }
  };
  Object.assign(opts, assigned);

  return opts;
}
