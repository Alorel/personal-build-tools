import {expect} from 'chai';
import {alo} from '../../src/alo';
import {Fixture} from '../util/Fixture';

//tslint:disable:object-literal-sort-keys

describe('sort-deps', () => {
  let fixture: Fixture;
  let initialCwd: string;

  before('init fixture', () => {
    fixture = new Fixture('sort-deps');

    return fixture.write();
  });

  before('modify cwd', () => {
    initialCwd = process.cwd();
    process.chdir(fixture.outDir());
  });

  before('run', () => alo(['sort-deps', '-i', '3', '-g', 'fixture.json']));

  it('Test contents', async () => {
    const expected = JSON.stringify(
      {
        name: 'sort-deps-fixture',
        dependencies: {
          bar: '0.0.1',
          foo: '0.0.0'
        },
        devDependencies: {
          qux: '0.0.2'
        }
      },
      null,
      3 //tslint:disable-line:no-magic-numbers
    );

    expect(await fixture.readOut('fixture.json')).to.eq(expected);
  });

  after('restore cwd', () => {
    if (initialCwd) {
      process.chdir(initialCwd);
    }
  });
});
