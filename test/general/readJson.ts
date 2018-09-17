import {expect} from 'chai';
import {readJson} from '../../src/fns/readJson';

describe('readJson', function () {
  let cwd: string;

  before('snapshot cwd', () => {
    cwd = process.cwd();
    process.chdir(__dirname);
  });

  it('read default package.json', () => {
    expect(readJson()).to.be.null;
  });

  it('read custom tslint', () => {
    expect(readJson('tslint.json')).to.deep.eq({
      extends: '../commands/tslint.json'
    });
  });

  after('restore cwd', () => {
    if (cwd) {
      process.chdir(cwd);
    }
  });
});
