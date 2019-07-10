import * as fs from 'fs-extra';
import {TRAVIS_NODE_VERSIONS} from '../../const/TRAVIS_NODE_VERSIONS';
import {PackageManager} from '../../inc/PackageManager';
import {InitConf} from '../../interfaces/InitConf';
import {Git} from '../Git';
import {Log} from '../Log';
import {ObjectWriter, ObjectWriterFormat} from '../ObjectWriter';
import {PromptableConfig} from '../PromptableConfig';

const enum Conf {
  TRAVIS_YML = '.travis.yml'
}

export function handle(c: PromptableConfig<InitConf>) {
  if (fs.pathExistsSync(Conf.TRAVIS_YML)) {
    Log.info('Skipping .travis.yml generation');

    return;
  }

  Log.info('Generating .travis.yml');

  const isYarn = c.promptedPkgMgr() === PackageManager.YARN;

  const w = new ObjectWriter(Conf.TRAVIS_YML, ObjectWriterFormat.YAML);
  w.set('language', 'node_js');
  w.set('node_js', TRAVIS_NODE_VERSIONS);

  const beforeInstall: string[] = [
    isYarn ? 'npm i -g yarn greenkeeper-lockfile' : 'npm i -g greenkeeper-lockfile',
    'greenkeeper-lockfile-update'
  ];

  w.set('before_install', beforeInstall);
  w.set('install', isYarn ? 'yarn install --check-files' : 'npm install');
  w.set('script', [
    `${c.promptedPkgMgr()} run tslint`,
    `${c.promptedPkgMgr()} run typecheck`,
    `${c.promptedPkgMgr()} test${isYarn ? ' ' : ' -- '}--forbid-only --forbid-pending`
  ]);
  w.set('after_script', 'if [[ $GH_TOKEN ]]; then greenkeeper-lockfile-upload; fi;');
  w.set('after_success', 'cat ./coverage/lcov.info | coveralls');

  if (isYarn) {
    w.set('cache.yarn', true);
  } else {
    w.set('cache.directories', ['./node_modules']);
  }

  const shouldSkipRelease: boolean = process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS ?
    !!process.env.TEST_SKIP_TRAVIS_RELEASE : c.get('skipTravisRelease');

  if (!shouldSkipRelease) {
    Log.info('Generating release info @ .travis.yml');
    const bfi: string[] = [];
    if (isYarn) {
      bfi.unshift('npm i -g yarn');
    }

    //tslint:disable:object-literal-sort-keys
    w.set('stages', [
      'Test',
      {
        name: 'Release',
        if: 'branch = master AND type = push AND (NOT tag IS present)'
      }
    ]);
    let finalReleaseBeforeInstall: string | string[];

    switch (bfi.length) {
      case 0:
        finalReleaseBeforeInstall = [];
        break;
      case 1:
        finalReleaseBeforeInstall = bfi[0];
        break;
      default:
        finalReleaseBeforeInstall = bfi;
    }

    w.set('jobs.include', [{
      stage: 'Release',
      node_js: 'stable',
      before_install: finalReleaseBeforeInstall,
      before_script: [
        `${c.promptedPkgMgr()} run build`,
        'alo copy-files'
      ],
      script: 'semantic-release',
      after_success: [],
      after_script: []
    }]);
    //tslint:disable:object-literal-sort-keys
  } else {
    Log.info('Skipping release info @ .travis.yml');
  }

  w.save();
  Git.add(Conf.TRAVIS_YML);
  Log.success('Generated .travis.yml');
}
