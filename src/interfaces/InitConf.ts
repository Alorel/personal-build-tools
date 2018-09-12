import {HasEmail, HasName, HasUserWebsite} from '../commons/identity';
import {License} from '../inc/License';

export interface InitConf extends HasName, HasUserWebsite, HasEmail {
  license: License;

  skipGitignore: boolean;

  skipLicense: boolean;
}
