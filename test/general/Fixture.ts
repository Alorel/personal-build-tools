import {expect} from 'chai';
import * as fs from 'fs';
import {join} from 'path';
import {MITLicenceTpl} from '../../src/interfaces/LicenseTpl';
import {Fixture} from '../../src/lib/Fixture';
import {tmpFile} from '../util/tmp-test';

describe('Fixture', () => {
  let tmpLoc: string;
  let fix: Fixture;

  before('init fixture', () => {
    fix = new Fixture('init/license');
  });

  describe('read', () => {
    let c: Buffer;

    before('read', () => {
      c = fix.read('MIT.txt');
    });

    it('Should return buffer', () => {
      expect(Buffer.isBuffer(c)).to.be.true;
    });

    it('Should equal contents', () => {
      expect(c.toString()).to
        .eq(fs.readFileSync(join(fix['srcDir'], 'MIT.txt'), 'utf8'));
    });
  });

  describe('copy', () => {
    before('init tmploc', () => {
      tmpLoc = tmpFile();
    });

    before('run', () => fix.copy('MIT.txt', tmpLoc));

    it('', () => {
      expect(fix.read('MIT.txt').toString()).to.eq(fs.readFileSync(tmpLoc, 'utf8'));
    });
  });

  describe('template', () => {
    let tpl: MITLicenceTpl;
    let expected: string;

    before('init tpl', () => {
      tpl = {
        email: 'foo@bar.com',
        name: 'foo',
        url: 'https://foo.com',
        year: 1000
      };
    });

    before('init expected', () => {
      expected = `MIT License

Copyright (c) 1000 foo <foo@bar.com> (https://foo.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
    });

    before('tmploc', () => {
      tmpLoc = tmpFile();
    });

    it('should return string if "to" is not provided', () => {
      expect(fix.template<MITLicenceTpl>('MIT.txt', tpl)).to.eq(expected);
    });

    it('Should write to dest', () => {
      expect(fix.template<MITLicenceTpl>('MIT.txt', tpl, tmpLoc)).to.be.undefined;
      expect(fs.readFileSync(tmpLoc, 'utf8')).to.eq(expected);
    });
  });
});
