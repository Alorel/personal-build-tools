import {expect} from 'chai';
import * as fs from 'fs-extra';
import {isEmpty, noop} from 'lodash';
import {v4 as uuid} from 'uuid';
import {ConfigWriter} from '../../src/lib/ConfigWriter';

describe('ConfigWriter', () => {
  let initialSnapshot: ConfigWriter;

  before('init initial snapshot', () => {
    initialSnapshot = new ConfigWriter();
  });

  before('remove file', () => fs.unlink(ConfigWriter.filepath).catch(noop));

  describe('Setting data without saving', () => {
    const k = uuid();
    const v = uuid();
    let w: ConfigWriter;

    before('set', () => {
      w = new ConfigWriter().set(k, v);
    });

    it('Should be reflected in data', () => {
      expect(w['data']).to.deep.eq({global: {[k]: v}});
    });

    it('Should not be persisted', () => {
      expect(new ConfigWriter()['data']).to.be.empty;
    });
  });

  describe('Setting data with saving', () => {
    const globalK = uuid();
    const globalV = uuid();
    const scopedK = uuid();
    const scopedV = uuid();
    const scope = uuid();

    let data: any;

    before('write', () => {
      new ConfigWriter()
        .set(globalK, globalV)
        .set(scopedK, scopedV, scope)
        .save();
    });

    before('read', () => {
      data = new ConfigWriter()['data'];
    });

    it('Check contents', () => {
      const expected = {
        global: {
          [globalK]: globalV
        },
        [scope]: {
          [scopedK]: scopedV
        }
      };

      expect(data).to.deep.eq(expected);
    });

    after('cleanup', () => new ConfigWriter().clear());
  });

  describe('unset', () => {
    const w = new ConfigWriter()
      .set('a', 'b', 'two')
      .set('c', 'd', 'two')
      .set('e', 'f');

    it('initial', () => {
      expect(w['data']).to.deep.eq({
        global: {
          e: 'f'
        },
        two: {
          a: 'b',
          c: 'd'
        }
      });
    });

    it('after rm', () => {
      w.unset('e')
        .unset('c', 'two');

      expect(w['data']).to.deep.eq({
        two: {
          a: 'b'
        }
      });
    });
  });

  describe('clear', () => {
    before('set data', () => {
      new ConfigWriter().set(uuid(), uuid()).save();
    });

    it('Should not be empty initially', () => {
      expect(new ConfigWriter()['data']).to.not.be.empty;
    });

    it('should be empty after clearing', () => {
      expect(new ConfigWriter().clear()['data']).to.be.empty;
    });

    after('cleanup', () => new ConfigWriter().clear());
  });

  after('restore snapshot', () => {
    if (initialSnapshot && !isEmpty(initialSnapshot['data'])) {
      initialSnapshot['write']();
    }
  });
});
