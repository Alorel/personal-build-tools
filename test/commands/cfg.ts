import {expect} from 'chai';
import {v4 as uuid} from 'uuid';
import {alo} from '../../src/alo';
import {ConfigWriter} from '../../src/lib/ConfigWriter';
import {Crypt} from '../../src/lib/Crypt';

describe('cfg', () => {
  function clear() {
    new ConfigWriter().clear();
  }

  let initialSnapshot: ConfigWriter;

  before('init initial snapshot', () => {
    initialSnapshot = new ConfigWriter();
  });

  describe('set encrypted', () => {
    let pwd: string;
    let k: string;
    let v: string;
    let scope: string;

    function mkUuids() {
      pwd = 'pwd-' + uuid();
      k = 'key-' + uuid();
      v = 'value-' + uuid();
      scope = 'scope-' + uuid();
    }

    after('clear', clear);

    describe.skip('prompt pwd', () => {
      before('clear', clear);
      after('clear', clear);
      before('generate uuids', mkUuids);

      it('should prompt for password (fail in CI)', async () => {
        let passed = false;
        try {
          await alo(['cfg', 'set', '--encrypt', k, v, scope]);
          passed = true;
        } catch (e) {
          expect(e.message).to.match(/unable to prompt in test environment/i);
        }
        if (passed) {
          throw new Error('Command didn\'t throw');
        }
      });
    });

    describe('pwd set', () => {
      let w: ConfigWriter;
      before('clear', clear);
      after('clear', clear);
      before('generate uuids', mkUuids);
      before('run', () => alo(['cfg', 'set', '--encrypt', '--password', pwd, k, v, scope]));
      before('init cfg writer', () => {
        w = new ConfigWriter();
      });

      it('Should be encrypted', () => {
        expect(typeof w['data'][scope][k].__encrypted).to.eq('string');
      });

      it('should be encrypted correctly', () => {
        const dec = Crypt.decryptVar(w['data'][scope][k], pwd);
        expect(dec).to.eq(v);
      });
    });
  });

  describe('set', () => {
    let k: string;
    let vs: string;
    let v: string;
    let s: string;
    let data: any;

    before('clear', clear);
    before('init uuids', () => {
      k = uuid();
      v = uuid();
      vs = JSON.stringify({[uuid()]: uuid()});
      s = uuid();
    });

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
