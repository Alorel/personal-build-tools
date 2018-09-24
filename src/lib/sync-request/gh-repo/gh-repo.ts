import {memoize} from 'lodash';
import {join} from 'path';
import {ext} from '../../../const/ext';
import {execLocal} from '../../../fns/execLocal';
import {Log} from '../../Log';
import {RepoDetails} from './RepoDetails';

function getGhRepoData$(token: string, owner: string, repo: string): RepoDetails {
  const args = [
    '--token',
    token,
    '--owner',
    owner,
    '--repo',
    repo
  ];
  Log.info(`Querying GitHub repo data for ${owner}/${repo}`);
  const ret = execLocal(join(__dirname, `get.${ext}`), args);

  if (ret.status === 0) {
    return JSON.parse(ret.stdout);
  }

  throw new Error(ret.stderr);
}

export const getGhRepoData: typeof getGhRepoData$ = memoize(getGhRepoData$);
