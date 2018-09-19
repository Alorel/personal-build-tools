import {jsonToGraphQLQuery} from 'json-to-graphql-query';
import {get, map} from 'lodash';
import {join} from 'path';
import * as yargs from 'yargs';
import {CACHE_DIR} from '../../../const/CACHE_DIR';
import {ConfigWriter} from '../../ConfigWriter';
import {request} from '../../request';
import {RepoDetails} from './gh-repo';

interface RepoSource {
  owner: string;

  repo: string;
}

interface Args extends yargs.Arguments, RepoSource {
  token: string;
}

const argv: Args = <Args>yargs
  .option('token', {
    demandOption: true,
    type: 'string'
  })
  .option('owner', {
    demandOption: true,
    type: 'string'
  })
  .option('repo', {
    demandOption: true,
    type: 'string'
  })
  .argv;

const cfgFile = join(CACHE_DIR, 'gh-repo.yml');
const writer = new ConfigWriter(cfgFile);

//tslint:disable:no-magic-numbers

const query = jsonToGraphQLQuery({
  repository: {
    __args: {
      name: argv.repo,
      owner: argv.owner
    },
    description: true,
    id: true,
    repositoryTopics: {
      __args: {
        first: 100
      },
      edges: {
        node: {
          topic: {
            name: true
          }
        }
      }
    }
  }
});

request
  .post({
    headers: {
      Authorization: `bearer ${argv.token}`
    },
    json: {
      query: `{${query}}`
    },
    url: 'https://api.github.com/graphql'
  })
  .then(
    (rsp: any) => {
      if (typeof rsp === 'string') {
        rsp = JSON.parse(rsp);
      }

      rsp = rsp.data.repository;
      let edges: any[];
      const out: RepoDetails = {
        id: rsp.id
      };

      if (rsp.description) {
        out.description = rsp.description;
      }
      if ((edges = get(rsp, 'repositoryTopics.edges', [])).length) {
        out.tags = map(edges, 'node.topic.name');
      }

      process.stdout.write(JSON.stringify(out, null, 2));
      writer.set(argv.repo, out, argv.owner).save();
    }
  )
  .catch((e: Error) => {
    process.stderr.write(e.stack || e.message || e.toString());

    const cached = writer.get<RepoSource>(argv.repo, argv.owner);
    if (cached) {
      process.stdout.write(JSON.stringify(cached, null, 2));
    } else {
      process.stdout.write('null');
    }
  });
