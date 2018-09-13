import {expect} from 'chai';
import * as fs from 'fs-extra';
import {LineReadWriter} from '../../src/lib/LineReadWriter';
import {tmpFile} from '../util/tmp-test';

describe('LineReadWriter', () => {
  let contents: string;
  let lines: string[];

  before('init contents', async () => {
    contents = (await fs.readFile(__filename, 'utf8')).trim()
      .split(/\n/g)
      .map(l => l.trim())
      .join('\n');
  });

  it('ensureRegex', () => {
    const l = LineReadWriter.createFromContents('')
      .ensure('foo', 'bar')
      .ensureRegex(/^foo/, 'foo-')
      .ensureRegex(/^qux/, 'qux-')
      ['lines'];

    expect(l).to.deep.eq(['foo', 'bar', 'qux-']);
  });

  before('init lines', () => {
    lines = contents.split(/\n/g).map(l => l.trim());
  });

  it('save should throw if no file is provided', () => {
    expect(() => LineReadWriter.createFromContents('').save())
      .to.throw('Unable to get dirname: file not set');
  });

  it('from contents', () => {
    expect(LineReadWriter.createFromContents(contents)['lines'])
      .to.deep.eq(lines);
  });

  it('from file', () => {
    expect(LineReadWriter.createFromFile(__filename)['lines'])
      .to.deep.eq(lines);
  });

  it('toString()', () => {
    expect(LineReadWriter.createFromContents(contents).toString())
      .to.eq(`${contents}\n`);
  });

  it('ensure', () => {
    const lrw = LineReadWriter.createFromContents('')
      .ensure('foo', 'foo', 'bar');

    expect(lrw['lines']).to.deep.eq(['foo', 'bar']);
  });

  describe('save', () => {
    let p: string;

    before('write', async () => {
      p = tmpFile();
      await fs.writeFile(p, 'qux\nbaz\n');
      LineReadWriter.createFromFile(p)
        .ensure('foo')
        .save();
    });

    it('', async () => {
      expect(await fs.readFile(p, 'utf8')).to.eq('qux\nbaz\nfoo\n');
    });
  });
});
