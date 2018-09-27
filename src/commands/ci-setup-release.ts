import * as fs from 'fs';
import {Base64} from 'js-base64';
import {EOL} from 'os';
import {CommandModule} from 'yargs';
import {cmdName} from '../fns/cmdName';
import {xSpawnSync} from '../fns/xSpawn';
import {Git} from '../lib/Git';
import {Log} from '../lib/Log';
import {tmp} from '../lib/tmp';

interface Conf {
  quiet: boolean;
}

const cmd: CommandModule = {
  builder(argv) {
    return argv.option('quiet', {
      alias: 'q',
      default: false,
      type: 'boolean'
    });
  },
  command: cmdName(__filename),
  handler(c: Conf) {
    const GPG_KEY_ID = process.env.BUILD_GPG_KEY_ID;
    const GPG_KEY_PWD = process.env.BUILD_GPG_KEY_PWD;
    const GPG_PRIV_KEY = Base64.decode(process.env.BUILD_GPG_PRIV_KEY || '');
    const GPG_PUB_KEY = Base64.decode(process.env.BUILD_GPG_PUB_KEY || '');

    if ((!GPG_KEY_ID || !GPG_KEY_PWD || !GPG_PRIV_KEY || !GPG_PUB_KEY)) {
      Log.err('Missing required environment variables');

      if (!c.quiet) {
        process.exit(1);
      }

      return;
    }

    const keyContents = GPG_PUB_KEY + EOL + EOL + GPG_PRIV_KEY;
    const plaintextFile = tmp.fileSync({mode: 0o600});

    fs.writeFileSync(plaintextFile.name, keyContents);

    const gpgImport = xSpawnSync(
      'gpg',
      [
        '--batch',
        '--yes',
        '--import',
        plaintextFile.name
      ],
      {stdio: 'inherit'}
    );
    if (gpgImport.status !== 0) {
      process.exit(1);
    }
    plaintextFile.removeCallback();

    const gpgWithPassphraseFile = tmp.fileSync({
      discardDescriptor: true,
      keep: true,
      mode: 0o700
    });
    const plaintextContents = [
      '/usr/bin/gpg2',
      '--passphrase',
      GPG_KEY_PWD,
      '--batch',
      '--no-tty',
      '"$@"'
    ].join(' ') + EOL;
    fs.writeFileSync(gpgWithPassphraseFile.name, plaintextContents);
    Git.cfg('gpg.program', gpgWithPassphraseFile.name);
    Git.cfg('commit.gpgsign', 'true');
    Git.cfg('user.signingkey', GPG_KEY_ID, true);
  }
};

export = cmd;
