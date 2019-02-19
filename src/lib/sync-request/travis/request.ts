import * as Bluebird from 'bluebird';
import {map} from 'lodash';
import {StatusCodeError} from 'request-promise/errors';
import * as yargs from 'yargs';
import {request} from '../../request';

interface BaseArgs extends yargs.Arguments {
  owner: string;

  pro: boolean;

  repo: string;

  token: string;
}

interface SetArgs extends BaseArgs {
  name: string;

  public: boolean;

  value: string;
}

function mkRequest(token: string) {
  return request.defaults({
    headers: {
      authorization: `token ${token}`,
      'Travis-API-Version': '3'
    }
  });
}

function mkSlug(owner: string, repo: string): string {
  return encodeURIComponent(`${owner}/${repo}`);
}

function endpoint(c: BaseArgs, suffix = '/env_vars'): string {
  return `https://api.travis-ci.${c.pro ? 'com' : 'org'}/repo/${mkSlug(c.owner, c.repo) + suffix}`;
}

function statusCodeExit(e: StatusCodeError) {
  //tslint:disable-next-line:no-magic-numbers
  process.exit(e.statusCode === 409 ? 0 : e.statusCode);
}

yargs
  .option('token', {
    demandOption: true,
    global: true,
    type: 'string'
  })
  .option('pro', {
    default: false,
    global: true,
    type: 'boolean'
  })
  .option('owner', {
    demandOption: true,
    global: true,
    type: 'string'
  })
  .option('repo', {
    demandOption: true,
    global: true,
    type: 'string'
  })
  .command<SetArgs>({
    command: 'get-env-vars',
    describe: 'Get a list of env var names',
    handler(c: BaseArgs) {
      mkRequest(c.token).get(endpoint(c), {json: true})
        .then((r: any) => {
          //tslint:disable-next-line:no-magic-numbers
          const enc = JSON.stringify(map(r.env_vars || [], 'name').sort(), null, 2);
          process.stdout.write(enc);
        })
        .catch(statusCodeExit);
    }
  })
  .command({
    command: 'set-std-settings',
    describe: 'Set standard repo settings',
    handler(c: BaseArgs) {
      const rq = mkRequest(c.token);

      Bluebird
        .each(['auto_cancel_pushes', 'auto_cancel_pull_requests', 'builds_only_with_travis_yml'], v => {
          return rq.patch(endpoint(c, `/setting/${v}`), {
            json: {
              'setting.value': true
            }
          });
        });
    }
  })
  .command<SetArgs>({
    builder(argv: yargs.Argv<any>): any {
      return argv
        .option('public', {
          default: false,
          type: 'boolean'
        })
        .option('name', {
          demandOption: true,
          type: 'string'
        })
        .option('value', {
          demandOption: true,
          type: 'string'
        });
    },
    command: 'set-env-var',
    describe: 'Set an env var',
    handler(c) {
      const payload: any = {
        'env_var.name': c.name,
        'env_var.public': c.public,
        'env_var.value': c.value
      };

      mkRequest(c.token)
        .post(endpoint(c), {json: payload})
        .catch(statusCodeExit);
    }
  })
  .demandCommand(1)
  .parse();
