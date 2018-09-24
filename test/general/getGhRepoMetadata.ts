import {expect} from 'chai';
import {Suite} from 'mocha';
import {getGhRepoData} from '../../src/lib/sync-request/gh-repo/gh-repo';
import {RepoDetails} from '../../src/lib/sync-request/gh-repo/RepoDetails';

const SUITE_NAME = 'get gh repo metadata';

function suite(this: Suite) {
  let details: RepoDetails;

  before('run', function () {
    details = getGhRepoData(<string>process.env.GH_TOKEN, 'Alorel', 'personal-build-tools');
  });

  it('should have an id', () => {
    expect(typeof details.id).to.eq('string');
  });

  it('should have a description', () => {
    expect(typeof details.description).to.eq('string');
  });

  it('should have a topics array', () => {
    expect(Array.isArray(details.tags)).to.be.true;
  });
}

if (process.env.GH_TOKEN) {
  describe(SUITE_NAME, suite);
} else {
  describe.skip(SUITE_NAME, suite);
}
