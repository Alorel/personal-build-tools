import * as rq$ from 'request-promise';

export const request: typeof rq$ = rq$.defaults({
  gzip: true,
  headers: {
    'user-agent': `node ${process.version}`
  }
});
