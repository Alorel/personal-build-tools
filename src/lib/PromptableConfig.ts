import {cloneDeep} from 'lodash';
import * as rl$ from 'readline-sync';

let rl: typeof rl$;

if (process.env.CI || process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS) {
  rl = cloneDeep(rl$);

  function throwError() {
    throw new Error('Unable to prompt in test environment; Please set full configuration.');
  }

  for (const k of Object.keys(rl)) {
    if (typeof rl[k] === 'function') {
      rl[k] = throwError;
    }
  }
} else {
  rl = rl$;
}

export class PromptableConfig<T extends { [k: string]: any }> {
  public static readonly EMAIL = 'What\'s your email? ';

  public static readonly GH_REPO = 'What\'s your GitHub repo? ';

  public static readonly GH_USER = 'What\'s your GitHub username? ';

  public static readonly NAME = 'What\'s your name? ';

  public static readonly URL = 'What\'s your url? ';

  public constructor(private readonly data: T) {
  }

  public get<K extends keyof T>(k: K): T[K] {
    return this.data[k];
  }

  public getPrompt<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.question(question), forbidEmpty, strict);
  }

  public getPromptEmail<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.questionEMail(question), forbidEmpty, strict);
  }

  public getPromptSelect<K extends keyof T>(k: K, question: string, opts: string[], strict = true): T[K] {
    if (this.has(k, strict)) {
      return this.data[k];
    } else {
      const idx = rl.keyInSelect(opts, question, {cancel: false});
      this.data[k] = opts[idx];

      return this.data[k];
    }
  }

  public has(k: keyof T, strict = true): boolean {
    return strict ? this.data[k] !== undefined : !!this.data[k];
  }

  private promptCommon<K extends keyof T>(k: K, askFn: () => string, forbidEmpty: boolean, strict: boolean): T[K] {
    if (this.has(k, strict)) {
      return this.data[k];
    } else if (forbidEmpty) {
      let v: string;
      do {
        v = askFn();
      } while (!v);

      this.data[k] = v;

      return this.data[k];
    } else {
      this.data[k] = askFn();

      return this.data[k];
    }
  }
}
