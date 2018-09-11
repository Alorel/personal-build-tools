import {expect} from 'chai';
import {v4 as uuid} from 'uuid';
import {ConfigWriter} from '../../src/lib/ConfigWriter';

describe('ConfigWriter', () => {
  let initialSnapshot: ConfigWriter;

  before('init initial snapshot', () => {
    initialSnapshot = new ConfigWriter();
  });

  before('remove file', () => new ConfigWriter().clear());

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

    before('remove file', () => new ConfigWriter().clear());

    before('write', () => {
      new ConfigWriter()
        .set(globalK, globalV)
        .set(scopedK, scopedV, scope)
        .refreshAndSave();
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
    let w: ConfigWriter;
    before('remove file', () => new ConfigWriter().clear());
    before('write', () => {
      w = new ConfigWriter()
        .set('a', 'b', 'two')
        .set('c', 'd', 'two')
        .set('e', 'f');
    });

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
    before('remove file', () => new ConfigWriter().clear());
  });

  describe('clear', () => {
    before('remove file', () => new ConfigWriter().clear());
    before('set data', () => {
      new ConfigWriter().set(uuid(), uuid()).refreshAndSave();
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
    if (initialSnapshot) {
      initialSnapshot.save();
    }
  });
});
