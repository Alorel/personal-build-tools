import {PackageManager} from '../inc/PackageManager';
import {PullRequestTpl} from './PullRequestTpl';

export interface ContributingTpl extends PullRequestTpl {
  extraLines: string;

  pkgMgr: PackageManager;
}
