import {PkgVersionCacheEntry} from './PkgVersionCacheEntry';

export interface PkgVersionCache {
  [pkg: string]: PkgVersionCacheEntry;
}
