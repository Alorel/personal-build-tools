import {sortObjectByKey} from '../../fns/sortObjectByKey';
import {InitConf} from '../../interfaces/InitConf';
import {Git} from '../Git';
import {ObjectWriter, ObjectWriterFormat} from '../ObjectWriter';
import {PromptableConfig} from '../PromptableConfig';
import {getPkgVersions} from '../sync-request/pkg-version/pkg-version';

export function handle(c: PromptableConfig<InitConf>): void {
  const w = new ObjectWriter('package.json', ObjectWriterFormat.JSON);

  function mkFilter(key: string) {
    return (d: string) => !w.has([key, d]);
  }

  const devExact: string[] = [
    '@alorel-personal/build-tools',
    '@alorel-personal/conventional-changelog-alorel',
    '@alorel-personal/semantic-release',
    '@alorel-personal/tslint-rules'
  ].filter(mkFilter('devDependencies'));

  let devTilde: string[] = [
    '@semantic-release/changelog',
    '@semantic-release/exec',
    '@semantic-release/git',
    '@semantic-release/npm',
    '@types/node',
    'mocha',
    'concurrently',
    'source-map-support',
    '@types/mocha',
    'chai',
    '@types/chai',
    'semantic-release',
    'coveralls',
    'typescript',
    'nyc',
    'rimraf',
    'tslib',
    'ts-node',
    'typescript'
  ];

  if (c.get('umd')) {
    devTilde.push('webpack', 'webpack-cli', 'ts-loader');
  }

  devTilde = devTilde.filter(mkFilter('devDependencies'));

  const pkgsToQuery = devExact.concat(devTilde).sort();

  if (pkgsToQuery.length) {
    const pkgVersions = getPkgVersions(...pkgsToQuery);

    if (devExact.length) {
      for (const pkg of devExact) {
        if (pkgVersions[pkg]) {
          w.set(['devDependencies', pkg], pkgVersions[pkg]);
        }
      }
    }
    if (devTilde.length) {
      for (const pkg of devTilde) {
        if (pkgVersions[pkg]) {
          w.set(['devDependencies', pkg], `~${pkgVersions[pkg]}`);
        }
      }
    }
    w.set('peerDependencies.tslib', '^1.6.0', false);

    if (w.has('devDependencies')) {
      w.set('devDependencies', sortObjectByKey(w.get('devDependencies')));
    }

    w.save();

    Git.add('package.json');
  }
}
