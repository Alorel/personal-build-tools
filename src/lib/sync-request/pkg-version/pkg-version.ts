import {memoize} from 'lodash';
import {join} from 'path';
import {ext} from '../../../const/ext';
import {execLocal} from '../../../fns/execLocal';
import {Log} from '../../Log';
import {PkgVersionCache} from './PkgVersionCache';

export type GetPkgVersionsOutput<T extends string> = {
  [k in T]?: string;
};

function getPkgVersions$<T extends string>(...packages: T[]): GetPkgVersionsOutput<T> {
  if (!packages.length) {
    return {};
  }
  Log.info('Querying package versions for the following packages:\n\t' + packages.join('\n\t'));
  const args: string[] = ['--pkgs'].concat(packages);
  const ret = execLocal(join(__dirname, `get.${ext}`), args);

  if (ret.status === 0) {
    const parsed: PkgVersionCache = JSON.parse(ret.stdout);

    return packages.reduce<GetPkgVersionsOutput<T>>(
      (acc, pkgName) => {
        if (parsed[pkgName]) {
          acc[pkgName] = parsed[pkgName].latest;
        }

        return acc;
      },
      {}
    );
  }

  throw new Error(ret.stderr);
}

export const getPkgVersions: typeof getPkgVersions$ = <any>memoize(getPkgVersions$);
