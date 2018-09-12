import {HasEmail, HasGhUser, HasName, HasUserWebsite} from '../commons/identity';
import {License} from '../inc/License';

export interface InitConf extends HasName, HasUserWebsite, HasEmail, HasGhUser {
  license: License;

  skipCodeOwners: boolean;

  skipGitignore: boolean;

  skipLicense: boolean;
}