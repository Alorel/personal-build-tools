import {cloneDeep, forEach} from 'lodash';
import {Colour} from '../lib/Colour';
import {Crypt} from '../lib/Crypt';
import {PromptableConfig} from '../lib/PromptableConfig';

const enum Conf {
  MAX_ATTEMPTS = 3
}

function setRegular(cfg: any, k: string, value: any): void {
  Object.defineProperty(cfg, k, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function setVirtual(pcfg: PromptableConfig<any>, cfg: any, k: string, v: any): void {
  let attempt = 1;
  const colourFns = [<any>undefined, Colour.green, Colour.yellow, Colour.red];

  Object.defineProperty(cfg, k, {
    configurable: true,
    enumerable: true,
    get: function getter(): any {
      const pwd = pcfg.promptedEncryptionPassword();
      try {
        const decrypted = Crypt.decryptVar(v, pwd);
        setRegular(cfg, k, decrypted);
        attempt = 1;

        return decrypted;
      } catch (e) {
        const msg = [
          Colour.red(e.message),
          ` [${colourFns[attempt].call(Colour, attempt)}/`,
          `${Colour.red(Conf.MAX_ATTEMPTS.toString())}]\n`
        ].join('');
        process.stderr.write(msg);

        if (attempt++ < Conf.MAX_ATTEMPTS) {
          delete pcfg['data'].password;
          pcfg.promptedEncryptionPassword['cache'].clear();

          return getter();
        } else {
          process.exit(1);
        }
      }
    },
    set(v$: any) {
      if (Crypt.isEncrypted(v$)) {
        setVirtual(pcfg, cfg, k, v$);
      } else {
        setRegular(cfg, k, v$);
      }
    }
  });
}

export function parseJointCfgForEncryption<T>(cfg: T): T {
  cfg = cloneDeep(cfg);
  const pcfg = new PromptableConfig(cfg);

  forEach(<any>cfg, (v: any, k: string) => {
    if (Crypt.isEncrypted(v)) {
      setVirtual(pcfg, cfg, k, v);
    }
  });

  return cfg;
}
