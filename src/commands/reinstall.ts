import {sync as rmrf} from 'rimraf';
import {CommandModule} from 'yargs';
import {addConfig} from '../fns/add-cmd/addConfig';
import {cmdName} from '../fns/cmdName';
import {xSpawnSync} from '../fns/xSpawn';
import {PackageManager} from '../inc/PackageManager';
import {Log} from '../lib/Log';
import {PromptableConfig} from '../lib/PromptableConfig';

interface Config {
  cwd?: string;

  keepLockfile: boolean;

  pkgMgr: PackageManager;
}

const command = cmdName(__filename);

const cmd: CommandModule<any, Config> = {
  builder(argv): any {
    return addConfig(argv, command)
      .positional('pkgMgr', {
        describe: 'Package manager in use. Can be inferred from existing lockfile.',
        type: 'string'
      })
      .option('cwd', {
        hidden: true,
        type: 'string'
      })
      .option('keep-lockfile', {
        alias: ['k', 'keep'],
        default: false,
        describe: 'Don\'t remove the lockfile',
        type: 'boolean'
      });
  },
  command: `${command} [pkgMgr]`,
  describe: 'Perform a clean reinstallation of node modules',
  handler(c$: Config): void {
    const initialCwd = process.cwd();
    try {
      if (c$.cwd) {
        process.chdir(c$.cwd);
      }
      const pkgMgr = new PromptableConfig<Config>(c$).promptedPkgMgr();

      Log.info('Removing node_modules');
      rmrf('node_modules');
      Log.success('Removed node_modules');

      if (!c$.keepLockfile) {
        if (pkgMgr === PackageManager.YARN) {
          rmrf('yarn.lock');
        } else {
          rmrf('package-lock.json');
          rmrf('npm-shrinkwrap.json');
        }
        Log.success('Removed lockfile');
      } else {
        Log.info('Keeping lockfile');
      }

      Log.info(`Running ${pkgMgr} install`);
      const args: string[] = ['install'];
      if (pkgMgr === PackageManager.YARN) {
        args.push('--check-files');
      }
      const sp = xSpawnSync(pkgMgr, args, {
        stdio: process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS ? 'ignore' : 'inherit'
      });

      if (sp.status !== 0) {
        throw new Error(`Exited with code ${sp.status}`);
      }
      Log.success(`${pkgMgr} install finished successfully.`);
    } finally {
      process.chdir(initialCwd);
    }
  }
};

export = cmd;
