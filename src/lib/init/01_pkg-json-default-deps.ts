import {uniq} from 'lodash';
import {PKG_JSON} from '../../const/PKG_JSON';
import {sortObjectByKey} from '../../fns/sortObjectByKey';
import {Git} from '../Git';
import {ObjectWriter, ObjectWriterFormat} from '../ObjectWriter';
import {getPkgVersions} from '../sync-request/pkg-version/pkg-version';

export function handle(): void {
  const w = new ObjectWriter('package.json', ObjectWriterFormat.JSON);

  function mkFilter(key: string) {
    return (d: string) => !w.has([key, d]);
  }

  const devExact: string[] = uniq([
    '@alorel-personal/conventional-changelog-alorel',
    '@alorel-personal/semantic-release',
    '@alorel-personal/tslint-rules'
  ]).filter(mkFilter('devDependencies'));

  let devTilde: string[] = [
    '@semantic-release/changelog',
    '@semantic-release/exec',
    '@semantic-release/git',
    '@semantic-release/npm',
    '@types/node',
    'mocha',
    'source-map-support',
    '@types/mocha',
    'chai',
    '@types/chai',
    'semantic-release',
    'coveralls',
    'nyc',
    'rimraf',
    'tslib',
    'ts-node',
    'typescript'
  ];

  devTilde = uniq(devTilde).filter(mkFilter('devDependencies'));

  const pkgsToQuery = devExact.concat(devTilde).sort();

  w.set(['devDependencies', PKG_JSON.name], PKG_JSON.version, false);

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
