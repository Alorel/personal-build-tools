import {expect} from 'chai';
import * as _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {Crypt} from '../../src/lib/Crypt';

describe('Crypt', function () {
  describe('isEncrypted', () => {
    describe('should fail if', () => {
      const cases = {
        'is null': null,
        'is undefined': undefined,
        'is 0 (falsy)': 0,
        'is false': false,
        'not an object': 'foo',
        '__encrypted is not present': {},
        '__encrypted is not a string': {__encrypted: 1}
      };

      _.forEach(cases, (v, k) => {
        it(k, () => {
          expect(Crypt.isEncrypted(v)).to.be.false;
        });
      });
    });
  });

  it('encryptVar', () => {
    const r = Crypt.encryptVar('x', 'y');
    expect(typeof r.__encrypted).to.eq('string');
  });

  describe('encrypt/decrypt', () => {
    const encDecs: { [k: string]: string } = {};
    let pwd: string;
    let str: string;

    before('generate pwd', () => {
      pwd = uuid();
    });

    before('generate str', () => {
      str = uuid();
    });

    before('generate enc dec', () => {
      for (let i = 0; i < 10; i++) {
        const encrypted = Crypt.encrypt(str, pwd);

        encDecs[encrypted] = Crypt.decrypt(encrypted, pwd);
      }
    });

    it('All encrypted results should be the different', () => {
      expect(_.uniq(Object.keys(encDecs))).to.have.lengthOf(10);
    });

    it('All decrypted results should be the same', () => {
      expect(_.uniq(_.values(encDecs))).to.have.lengthOf(1);
    });
  });
});
