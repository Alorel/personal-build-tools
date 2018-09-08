import * as cp from 'child_process';
import * as xSpawn from 'cross-spawn';
import {merge} from 'lodash';
import {v4 as uuid} from 'uuid';

describe('check-command', () => {
  function spawn(cmd: string, args: string[] = [], opts: cp.SpawnOptions = {}): cp.ChildProcess {
    const env = Object.assign({}, process.env, {TS_NODE_TRANSPILE_ONLY: 'true'});
    delete env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS;

    return xSpawn(
      cmd,
      args,
      merge(
        {
          env: env,
          stdio: 'ignore'
        },
        opts
      )
    );
  }

  it('Valid command should exit with 0', (cb: any) => {
    let err = false;
    spawn('ts-node', ['src/alo.ts', 'clean-dist', '--dist-dirs', uuid()])
      .once('error', e => {
        err = true;
        cb(e);
      })
      .once('exit', code => {
        if (!err) {
          if (code === 0) {
            cb();
          } else {
            cb(`Code ${code}`);
          }
        }
      });
  });

  it('Invalid command should exit with non-zero', (cb: any) => {
    let err = false;
    spawn('ts-node', ['src/alo.ts', uuid()])
      .once('error', () => {
        err = true;
        cb();
      })
      .once('exit', code => {
        if (!err) {
          if (code === 0) {
            cb('Exited with 0');
          } else {
            cb();
          }
        }
      });
  });
});
