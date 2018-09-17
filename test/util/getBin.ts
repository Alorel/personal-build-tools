import * as fs from 'fs';
import {has} from 'lodash';
import {dirname, join} from 'path';

export function getBin(pkg: string, binName: string): string {
  const pJsonPath = require.resolve(`${pkg}/package.json`);
  const pJson = JSON.parse(fs.readFileSync(pJsonPath, 'utf8'));

  if (!has(pJson, ['bin', binName])) {
    throw new Error(`${pkg} does not have the bin ${binName}`);
  }

  return join(dirname(pJsonPath), pJson.bin[binName]);
}
