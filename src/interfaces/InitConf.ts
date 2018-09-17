import {HasEmail, HasGhRepo, HasGhUser, HasName, HasUserWebsite} from '../commons/identity';
import {License} from '../inc/License';
import {PackageManager} from '../inc/PackageManager';

export interface InitConf extends HasName, HasUserWebsite, HasEmail, HasGhUser, HasGhRepo {
  license: License;

  pkgMgr: PackageManager;

  projectDesc: string;

  projectName: string;

  skipCodeOwners: boolean;

  skipGhIssueTpl: boolean;

  skipGitignore: boolean;

  skipLicense: boolean;
}
