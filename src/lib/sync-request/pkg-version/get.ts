import * as Bluebird from 'bluebird';
import {join} from 'path';
import {RequestResponse} from 'request';
import {OptionsWithUri} from 'request-promise';
import {StatusCodeError} from 'request-promise/errors';
import * as yargs from 'yargs';
import {CACHE_DIR} from '../../../const/CACHE_DIR';
import {ConfigWriter} from '../../ConfigWriter';
import {request} from '../../request';
import {NpmResponse} from './NpmResponse';
import {PkgVersionCache} from './PkgVersionCache';
import {PkgVersionCacheEntry} from './PkgVersionCacheEntry';

interface Args extends yargs.Arguments {
  pkgs: ReadonlyArray<string>;
}

const argv: Args = <Args>yargs
  .option('pkgs', {
    demandOption: true,
    type: 'array'
  })
  .argv;

const enum Conf {
  SCOPE = 'packages'
}

const cfgFile = join(CACHE_DIR, 'npm-package-cache.yml');
const writer = new ConfigWriter(cfgFile);

const rq = request.defaults({
  headers: {
    Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8'
  },
  json: true,
  resolveWithFullResponse: true
});

Bluebird
  .reduce<string, PkgVersionCache>(
    argv.pkgs,
    (acc, pkg) => {
      const cached = writer.get<PkgVersionCacheEntry>(pkg, Conf.SCOPE);
      const opts: OptionsWithUri = {
        uri: `https://registry.npmjs.com/${encodeURIComponent(pkg)}`
      };
      if (cached) {
        const headers: OptionsWithUri['headers'] = {};
        if (cached.etag) {
          headers['if-none-match'] = cached.etag;
        }
        if (cached.lastModified) {
          headers['if-modified-since'] = cached.lastModified;
        }
        opts.headers = headers;
      }

      return rq.get(opts)
        .then<PkgVersionCache>((rsp: RequestResponse) => {
          const body: NpmResponse = rsp.body;
          const toCache: PkgVersionCacheEntry = {
            latest: body['dist-tags'].latest
          };
          if (rsp.headers.etag) {
            toCache.etag = <string>rsp.headers.etag;
          }
          if (rsp.headers['last-modified']) {
            toCache.lastModified = rsp.headers['last-modified'];
          }
          writer.set(pkg, toCache, Conf.SCOPE);
          acc[pkg] = toCache;

          return acc;
        })
        .catch<PkgVersionCache>((e: StatusCodeError) => {
          //tslint:disable-next-line:no-magic-numbers
          if (e.statusCode < 400 && cached) {
            acc[pkg] = cached;
          }

          return acc;
        });
    },
    {}
  )
  .then(out => {
    writer.save();
    //tslint:disable-next-line:no-magic-numbers
    process.stdout.write(JSON.stringify(out, null, 2));
  })
  .catch((e: Error) => {
    process.stderr.write(e.stack || e.message || e.toString());
    process.exit(1);
  });
