import {License} from '../inc/License';

export interface PackageJson {
  dependencies: string;

  devDependencies: string;

  license: License;

  name: string;

  peerDependencies: string;

  repository: string;

  version: string;
}
