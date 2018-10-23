import {noop} from 'lodash';
import * as symbols from 'log-symbols';

export class Log {
  public static err(txt: string): void {
    process.stderr.write(`${symbols.error} ${txt}\n`);
  }

  public static info(txt: string): void {
    process.stdout.write(`${symbols.info} ${txt}\n`);
  }

  public static success(txt: string): void {
    process.stdout.write(`${symbols.success} ${txt}\n`);
  }

  public static warn(txt: string): void {
    process.stdout.write(`${symbols.warning} ${txt}\n`);
  }
}

if (process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS) {
  for (const k of ['err', 'info', 'success', 'warn']) {
    Log[k] = noop;
  }
}
