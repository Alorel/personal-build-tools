import {HasEmail, HasGhRepo, HasGhToken, HasGhUser, HasName, HasUserWebsite} from '../commons/identity';
import {HasTravisRelease} from '../commons/travisRelease';
import {License} from '../inc/License';
import {PackageManager} from '../inc/PackageManager';

export interface InitConf extends HasTravisRelease,
  HasName,
  HasUserWebsite,
  HasEmail,
  HasGhToken,
  HasGhUser,
  HasGhRepo {
  license: License;

  pkgMgr: PackageManager;

  projectDesc: string;

  projectKeywords: string;

  projectName: string;

  skipCodeOwners: boolean;

  skipGhIssueTpl: boolean;

  skipGitignore: boolean;

  skipLicense: boolean;
}
