import {expect} from 'chai';
import {getPkgVersions, GetPkgVersionsOutput} from '../../src/lib/sync-request/pkg-version/pkg-version';

describe('get pkg version', () => {
  let versions: GetPkgVersionsOutput<'typescript' | 'tslint'>;

  before('get', () => {
    versions = getPkgVersions('typescript', 'tslint');
  });

  it('Should have a typescript version', () => {
    expect(typeof versions.typescript).to.eq('string');
  });

  it('should have a tslint version', () => {
    expect(typeof versions.tslint).to.eq('string');
  });
});
