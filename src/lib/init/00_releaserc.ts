import * as fs from 'fs';
import {Git} from '../Git';
import {Log} from '../Log';

export function handler(): void {
  const hasReleaseRc: boolean = (() => {
    const rds = fs.readdirSync(process.cwd(), 'utf8');

    for (const f of rds) {
      if (f.startsWith('.releaserc')) {
        return true;
      }
    }

    return false;
  })();

  if (hasReleaseRc) {
    Log.info('Skipping .releaserc');

    return;
  }

  fs.writeFileSync('.releaserc.yml', `branch: master
tagFormat: '\${version}'

verifyConditions:
- path: &npm '@semantic-release/npm'
  pkgRoot: '.'
- &gh '@semantic-release/github'

prepare:
- '@semantic-release/changelog'
- '@alorel-personal/semantic-release'
- *npm
- path: &exec '@semantic-release/exec'
  cmd: yarn run doctoc
- path: *exec
  cmd: alo copy-files
- path: *exec
  cmd: alo clean-dist
- path: *exec
  cmd: alo clean-pkg-json
- path: '@semantic-release/git'
  message: 'chore(release): \${nextRelease.version}'
  assets:
  - CHANGELOG.md
  - README.md
  - package.json
  - yarn.lock

publish:
- path: *npm
  pkgRoot: './dist'
- *gh

generateNotes:
  config: '@alorel-personal/conventional-changelog-alorel'
`);

  Git.add('.releaserc.yml');

  Log.success('Generated .releaserc');
}
