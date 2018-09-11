import {expect} from 'chai';
import {v4 as uuid} from 'uuid';
import {alo} from '../../src/alo';
import {ConfigWriter} from '../../src/lib/ConfigWriter';

describe('cfg', () => {
  function clear() {
    new ConfigWriter().clear();
  }

  let initialSnapshot: ConfigWriter;

  before('init initial snapshot', () => {
    initialSnapshot = new ConfigWriter();
  });

  describe('set', () => {
    const k = uuid();
    const vs = JSON.stringify({[uuid()]: uuid()});
    const v = uuid();
    const s = uuid();
    let data: any;

    before('clear', clear);

    before('set JSON', () => alo(['cfg', 'set', k, vs, s]));
    before('set string', () => alo(['cfg', 'set', k, v]));
    before('get data', () => {
      data = new ConfigWriter()['data'];
    });

    it('check JSON', () => {
      expect(data[s][k]).to.deep.eq(JSON.parse(vs));
    });

    it('check string', () => {
      expect(data.global[k]).to.eq(v);
    });
  });

  describe('rm', () => {
    let w: ConfigWriter;
    before('clear', clear);

    beforeEach('init new config writer', () => {
      w = new ConfigWriter();
    });

    before('set', () => {
      new ConfigWriter().set('foo', 'bar')
        .set('qux', 'baz')
        .save();
    });

    it('Check initial', () => {
      expect(w['data']).to.deep.eq({global: {foo: 'bar', qux: 'baz'}});
    });

    it('rm', async () => {
      await alo(['cfg', 'rm', 'foo']);
      w.refresh();
      expect(w['data']).to.deep.eq({global: {qux: 'baz'}});
    });
  });

  describe('clear', () => {
    let w: ConfigWriter;

    beforeEach('init new config writer', () => {
      w = new ConfigWriter();
    });

    before('set some data', () => {
      new ConfigWriter().set(uuid(), uuid(), uuid())
        .set(uuid(), uuid())
        .save();
    });

    before('run', () => alo(['cfg', 'clear', '-y']));

    it('should be empty', () => {
      expect(w['data']).to.be.empty;
    });
  });

  after('Restore snapshot', () => {
    if (initialSnapshot) {
      initialSnapshot.save();
    }
  });
});
